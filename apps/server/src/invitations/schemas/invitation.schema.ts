import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document,  Schema as mongooseSchema, Types } from 'mongoose';

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
  CANCELED = 'CANCELED'
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
})

export class Invitation {
  @Prop({
    type: mongooseSchema.Types.ObjectId,
    ref:'Canvas',
    required: true,
    index: true
  })
  canvasId: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    index: true
  })
  fromUserId: string;

  @Prop({
    type: String,
    required: true,
    index: true
  })
  toUserId: string

  @Prop({
    type: String,
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
    index: true
  })
  status: InvitationStatus

  @Prop({
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  })
  expiresAt: Date;

  @Prop({
    type: String
  })
  message?: string;

  get isExpired(): boolean{
    return this.expiresAt < new Date();
  }

  get isActive(): boolean{
    return this.status === InvitationStatus.PENDING && !this.isExpired;
  }
}

export const InvitationSchema = SchemaFactory.createForClass(Invitation);

export type InvitationDocument = Invitation & Document;

InvitationSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date();
});

InvitationSchema.virtual('isActive').get(function() {
  return this.status === InvitationStatus.PENDING && !this.isExpired;
});

InvitationSchema.index(
  {
    canvasId: 1, toUserId: 1, status: 1 
  },
  {
    unique: true,
    partialFilterExpression: { status: 'pending'}
  }
);

InvitationSchema.index({
  toUserId: 1,
  status: 1,
  expiresAt: 1
})

