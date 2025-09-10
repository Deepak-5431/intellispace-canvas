import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async processAppwriteLogin(appwriteUserId: string, email: string): Promise<UserDocument> {
    let user = await this.userModel.findOne({ appwriteId: appwriteUserId }).exec();

    if (!user) {
      user = await this.userModel.create({
        appwriteId: appwriteUserId,
        email: email,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    return user;
  }

}