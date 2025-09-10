import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invitation, InvitationDocument, InvitationStatus } from './schemas/invitation.schema';
import { CanvasesService } from '../canvases/canvases.service';

@Injectable()
export class InvitationsService {
  constructor(
    @InjectModel(Invitation.name) private invitationModel: Model<InvitationDocument>,
    private readonly canvasesService: CanvasesService,
  ) {}

  async create(
    canvasId: Types.ObjectId,
    fromUserId: string,
    toUserId: string,
    message?: string,
  ): Promise<Invitation> {
   
    if (fromUserId === toUserId) {
      throw new ConflictException('You cannot invite yourself');
    }

    
    const canvas = await this.canvasesService.findOne(canvasId.toString());
    if (!canvas) {
      throw new NotFoundException('Canvas not found');
    }

   
    if (!canvas.collaborators.includes(fromUserId) && canvas.ownerId !== fromUserId) {
      throw new ConflictException('You do not have permission to invite to this canvas');
    }

   
    if (canvas.collaborators.includes(toUserId) || canvas.ownerId === toUserId) {
      throw new ConflictException('User is already a collaborator on this canvas');
    }

   
    const existingInvitation = await this.invitationModel.findOne({
      canvasId: canvasId,
      toUserId,
      status: InvitationStatus.PENDING,
      expiresAt: { $gt: new Date() },
    });

    if (existingInvitation) {
      throw new ConflictException('A pending invitation already exists for this user');
    }


    const newInvitation = new this.invitationModel({
      canvasId,
      fromUserId,
      toUserId,
      message,
    });

    return newInvitation.save();
  }

  async findAllForUser(userId: string): Promise<any[]> {
    // Validate userId is a valid ObjectId
    let userObjectId;
    try {
      userObjectId = new Types.ObjectId(userId);
    } catch (error) {
      throw new BadRequestException('Invalid user ID format');
    }

    return this.invitationModel.aggregate([
      // Stage 1: Find all pending invitations for the current user
      {
        $match: {
          toUserId: userObjectId,
          status: InvitationStatus.PENDING,
          expiresAt: { $gt: new Date() },
        },
      },
      // Stage 2: Join with the 'canvases' collection to get canvas details
      {
        $lookup: {
          from: 'canvases', // Make sure this matches your collection name
          localField: 'canvasId',
          foreignField: '_id',
          as: 'canvas',
        },
      },
      // Stage 3: Deconstruct the canvas array
      {
        $unwind: {
          path: '$canvas',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Stage 4: Join with the 'users' collection to get the sender's details
      {
        $lookup: {
          from: 'users', // Make sure this matches your collection name
          localField: 'fromUserId',
          foreignField: '_id',
          as: 'fromUser',
        },
      },
      // Stage 5: Deconstruct the fromUser array
      {
        $unwind: {
          path: '$fromUser',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Stage 6: Reshape the final output to match your GraphQL schema
      {
        $project: {
          id: { $toString: '$_id' }, // Convert ObjectId to string
          _id: 0,
          status: 1,
          fromUserId: { $toString: '$fromUserId' },
          canvasId: { $toString: '$canvasId' },
          canvasName: '$canvas.title', // Assuming your canvas has 'title' field
          fromUserEmail: '$fromUser.email', // Get sender's email
          expiresAt: 1,
          createdAt: 1,
          message: 1,
        },
      },
      // Stage 7: Sort by newest first
      {
        $sort: { createdAt: -1 },
      }
    ]).exec();
  }

  async findOne(invitationId: string): Promise<Invitation> {
    const invitation = await this.invitationModel
      .findById(invitationId)
      .populate('canvasId')
      .exec();

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    return invitation;
  }

  async acceptInvitation(invitationId: string, userId: string): Promise<Invitation> {
    const invitation = await this.invitationModel.findById(invitationId);

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // FIX: Convert ObjectId to string for comparison
    if (invitation.toUserId.toString() !== userId) {
      throw new ConflictException('You can only accept your own invitations');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new ConflictException('Invitation is no longer valid');
    }

    if (invitation.expiresAt < new Date()) {
      throw new ConflictException('Invitation has expired');
    }

    await this.canvasesService.addCollaborator(
      invitation.canvasId.toString(),
      userId,
    );

    invitation.status = InvitationStatus.ACCEPTED;
    return invitation.save();
  }

  async declineInvitation(invitationId: string, userId: string): Promise<Invitation> {
    const invitation = await this.invitationModel.findById(invitationId);

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // FIX: Convert ObjectId to string for comparison
    if (invitation.toUserId.toString() !== userId) {
      throw new ConflictException('You can only decline your own invitations');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new ConflictException('Invitation is no longer valid');
    }

    invitation.status = InvitationStatus.DECLINED;
    return invitation.save();
  }

  async cancelInvitation(invitationId: string, userId: string): Promise<Invitation> {
    const invitation = await this.invitationModel.findById(invitationId);

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // FIX: Convert ObjectId to string for comparison
    if (invitation.fromUserId.toString() !== userId) {
      throw new ConflictException('You can only cancel your own invitations');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new ConflictException('Only pending invitations can be cancelled');
    }

    // IMPROVEMENT: Use CANCELED status instead of DECLINED
    invitation.status = InvitationStatus.CANCELED;
    return invitation.save();
  }

  async expireOldInvitations(): Promise<void> {
    await this.invitationModel.updateMany(
      {
        status: InvitationStatus.PENDING,
        expiresAt: { $lt: new Date() },
      },
      {
        status: InvitationStatus.EXPIRED,
      },
    );
  }

  async getInvitationStats(userId: string): Promise<{
    pending: number;
    accepted: number;
    declined: number;
    canceled: number;
    expired: number;
  }> {
    
    let userObjectId;
    try {
      userObjectId = new Types.ObjectId(userId);
    } catch (error) {
      throw new BadRequestException('Invalid user ID format');
    }

    const stats = await this.invitationModel.aggregate([
      {
        $match: {
          $or: [
            { toUserId: userObjectId },
            { fromUserId: userObjectId },
          ],
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Initialize with all possible statuses
    const result = {
      pending: 0,
      accepted: 0,
      declined: 0,
      canceled: 0,
      expired: 0,
    };

    stats.forEach(stat => {
      if (stat._id in result) {
        result[stat._id] = stat.count;
      }
    });

    return result;
  }
}