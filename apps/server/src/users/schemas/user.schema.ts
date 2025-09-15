// apps/server/src/users/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_: any, ret: Record<string, any>) => {
      ret.id = ret._id;      // add id alias
      delete ret._id;        // remove internal _id
      if (ret.__v !== undefined) {
        delete ret.__v;      // remove version key if exists
      }
      return ret;
    },
  },
})
export class User {
  @Prop({ type: String, required: true, unique: true, index: true })
  userId: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  email: string;

  @Prop({ type: String })
  name?: string;
}

// ✅ Explicitly bind _id to ObjectId
export type UserDocument = Document<unknown, {}, User> &
  User & {
    _id: Types.ObjectId;
  };

export const UserSchema = SchemaFactory.createForClass(User);
