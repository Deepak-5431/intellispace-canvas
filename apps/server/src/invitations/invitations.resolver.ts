import { Resolver, Mutation, Args, Query, ID } from '@nestjs/graphql';
import { InvitationsService } from './invitations.service';
import { Invitation } from './invitation.model';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/currentUser.decorator';


interface UserPayload {
  id: string;
  name?: string;
  email?: string; 
}

@Resolver(() => Invitation)
@UseGuards(AuthGuard) 
export class InvitationsResolver {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Mutation(() => Invitation)
  async createInvitation(
    @Args('canvasId', { type: () => ID }) canvasId: string,
    @Args('toUserId', { type: () => ID }) toUserId: string,
    @Args('message', { type: () => String, nullable: true }) message: string,
    @CurrentUser() user: UserPayload,
  ) {
    return this.invitationsService.create(canvasId, user.id, toUserId, message);
  }

  @Query(() => [Invitation], { name: 'myInvitations' })
  async getMyInvitations(@CurrentUser() user: UserPayload) {
    return this.invitationsService.findAllForUser(user.id);
  }

  @Query(() => Invitation, { name: 'invitation' })
  async getInvitation(
    @Args('invitationId', { type: () => ID }) invitationId: string,
    @CurrentUser() user: UserPayload
  ) {
    return this.invitationsService.findOne(invitationId);
  }

  @Mutation(() => Invitation)
  async acceptInvitation(
    @Args('invitationId', { type: () => ID }) invitationId: string, 
    @CurrentUser() user: UserPayload
  ) {
    return this.invitationsService.acceptInvitation(invitationId, user.id);
  }

  @Mutation(() => Invitation)
  async declineInvitation(
    @Args('invitationId', { type: () => ID }) invitationId: string, 
    @CurrentUser() user: UserPayload
  ) {
    return this.invitationsService.declineInvitation(invitationId, user.id);
  }

  @Mutation(() => Invitation)
  async cancelInvitation(
    @Args('invitationId', { type: () => ID }) invitationId: string, 
    @CurrentUser() user: UserPayload
  ) {
    return this.invitationsService.cancelInvitation(invitationId, user.id);
  }
}