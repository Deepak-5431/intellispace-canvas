import { ObjectType, Field, ID,registerEnumType } from '@nestjs/graphql';
import { InvitationStatus } from '../invitations/schemas/invitation.schema';

registerEnumType(InvitationStatus, {
  name: 'InvitationStatus',
  description: 'The status of an invitation',
});

@ObjectType()
export class Invitation {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  canvasId: string;

  @Field()
  fromUserId: string;

  @Field()
  toUserId: string;

  @Field(() => InvitationStatus)
  status: InvitationStatus;

  @Field()
  expiresAt: Date;

  @Field({ nullable: true })
  message?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

 
  @Field()
  isExpired: boolean;

  @Field()
  isActive: boolean;
}