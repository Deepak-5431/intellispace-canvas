// apps/server/src/users/mongo-users.service.ts
import { Injectable, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class MongoUsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findByAppwriteId(appwriteUserId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ userId: appwriteUserId }).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }


  async findById(id: string): Promise<UserDocument> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`User with ID "${id}" not found.`); // Or BadRequestException
    }
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }
    return user;
  }


  async findOrCreateFromAppwrite(
    appwriteUserId: string,
    email: string,
    name?: string,
  ): Promise<UserDocument> {
    const now = new Date();

    try {
      const user = await this.userModel.findOneAndUpdate(
        { userId: appwriteUserId }, 
        {
          $set: { 
            email, 
            ...(name !== undefined && { name }), 
            updatedAt: now 
          },
          $setOnInsert: { 
            userId: appwriteUserId,
            createdAt: now 
          }
        },
        { 
          upsert: true, 
          new: true, 
          runValidators: true 
        }
      ).exec();

      return user;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('A user with this identifier already exists.');
      }
      
      throw new InternalServerErrorException('Failed to create or update user profile.');
    }
  }

 
  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }
}
export { UserDocument };