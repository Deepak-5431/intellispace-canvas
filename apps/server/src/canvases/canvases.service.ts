import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common'; // Added ForbiddenException
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Canvas } from './schemas/canvas.schema';

@Injectable()
export class CanvasesService {
  constructor(
    @InjectModel(Canvas.name) private canvasModel: Model<Canvas>,
  ) {
    console.log('CanvasesService initialized and ready for MongoDB!');
  }

  async create(name: string, ownerId: string, ownerName: string): Promise<Canvas> {
    const newCanvas = new this.canvasModel({ name, ownerId, ownerName });
    return newCanvas.save();
  }

  async findAllByOwner(ownerId: string): Promise<Canvas[]> {
    return this.canvasModel.find({ ownerId }).exec();
  }

  async update(
    id: string,
    updateData: { name?: string; canvasData?: string },
  ): Promise<Canvas | null> {
    return this.canvasModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async remove(id: string): Promise<Canvas | null> {
    return this.canvasModel.findByIdAndDelete(id).exec();
  }

  async findOne(id: string): Promise<Canvas | null> {
    return this.canvasModel.findById(id).exec();
  }

  async addCollaborator(canvasId: string, userId: string): Promise<Canvas> {
    const canvas = await this.canvasModel.findById(canvasId);
    
    if (!canvas) {
      throw new BadRequestException('Canvas not found');
    }

    if(canvas.ownerId === userId) {
      throw new BadRequestException('user is already a collaborator')
    }
    
    if (!canvas.collaborators.includes(userId)) {
      throw new BadRequestException('User is already a collaborator.');
    }
    
    canvas.collaborators.push(userId);
    return canvas;
  }

  async isUserCollaborator(canvasId: string, userId: string): Promise<boolean> {
    const canvas = await this.canvasModel.findById(canvasId);
    if (!canvas) {
      return false;
    }
    return canvas.ownerId === userId || canvas.collaborators.includes(userId);
  }

  async findCanvasesWhereUserIsCollaborator(userId: string): Promise<Canvas[]> {
    return this.canvasModel.find({ collaborators: userId }).exec();
  }

  async removeCollaborator(canvasId: string, currentUserId: string, userIdToRemove: string): Promise<void> {
    const canvas = await this.canvasModel.findById(canvasId);
    
    if (!canvas) {
      throw new NotFoundException('Canvas not found');
    }

    if (canvas.ownerId !== currentUserId) {
      throw new ForbiddenException('Only the owner can remove collaborators');
    }

    if (!canvas.collaborators.includes(userIdToRemove)) {
      throw new NotFoundException('User is not a collaborator on this canvas');
    }

    await this.canvasModel.findByIdAndUpdate(
      canvasId,
      { $pull: { collaborators: userIdToRemove } },
      { new: true }
    );
  }

  async leaveCanvas(canvasId: string, currentUserId: string): Promise<void> {
    const canvas = await this.canvasModel.findById(canvasId);
    
    if (!canvas) {
      throw new NotFoundException('Canvas not found');
    }

    if (canvas.ownerId === currentUserId) {
      throw new ForbiddenException('Owners cannot leave their own canvas. Use delete instead.');
    }

    if (!canvas.collaborators.includes(currentUserId)) {
      throw new ForbiddenException('You are not a collaborator on this canvas');
    }

    await this.canvasModel.findByIdAndUpdate(
      canvasId,
      { $pull: { collaborators: currentUserId } },
      { new: true }
    );
  }
}