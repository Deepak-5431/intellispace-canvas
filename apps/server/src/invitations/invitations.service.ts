// apps/server/src/invitations/invitations.service.ts

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
    canvasId: string,
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
  
    
    return this.invitationModel.aggregate([
      {
        $match: {
          toUserId: userId, 
          status: InvitationStatus.PENDING,
          expiresAt: { $gt: new Date() },
        },
      },
      {
        $lookup: {
          from: 'canvases', 
          localField: 'canvasId', 
          foreignField: '_id',    
          as: 'canvas',
        },
      },
      {
        $unwind: {
          path: '$canvas',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'users', 
          localField: 'fromUserId', 
          foreignField: 'userid',    //changing here from _id to userid  
          as: 'fromUser',
        },
      },
      {
        $unwind: {
          path: '$fromUser',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          id: { $toString: '$_id' }, 
          _id: 0,
          status: 1,
          fromUserId: 1, 
          toUserId: 1,   
          canvasId: { $toString: '$canvasId' }, 
          canvasName: '$canvas.name', 
          fromUserEmail: '$fromUser.email', 
          expiresAt: 1,
          createdAt: 1,
          message: 1,
        },
      },
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

    if (invitation.toUserId !== userId) {
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

    if (invitation.toUserId !== userId) {
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

    if (invitation.fromUserId !== userId) {
      throw new ConflictException('You can only cancel your own invitations');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new ConflictException('Only pending invitations can be cancelled');
    }

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

    
    const stats = await this.invitationModel.aggregate([
      {
        $match: {
          $or: [
            { toUserId: userId },   
            { fromUserId: userId }, 
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


