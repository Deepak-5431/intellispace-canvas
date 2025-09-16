import { UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Args, ObjectType, Field, ID, Query, InputType } from '@nestjs/graphql';
import { CanvasesService } from './canvases.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CurrentUser } from 'src/auth/currentUser.decorator';
//import { Canvas as CanvasSchema } from './schemas/canvas.schema';

@ObjectType()
class MutationResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String, { nullable: true })
  message?: string;
}

interface UserPayload {
  id: string;
  name?: string;
  email?: string;
}

@ObjectType()
class Canvas {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  ownerId: string;

  @Field()
  ownerName: string;

  @Field({ nullable: true })
  canvasData?: string;

  @Field(() => [String])
  collaborators: string[];
}

@InputType()
class UpdateCanvasInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  canvasData?: string;
}

@Resolver(() => Canvas)
export class CanvasesResolver {
  constructor(private readonly canvasesService: CanvasesService) {}

  @Query(() => String)
  sayHello(): string {
    return 'Hello World!';
  }

  @Query(() => [Canvas], { name: 'canvases' })
  @UseGuards(AuthGuard)
  async getCanvasesByOwner(@Args('ownerId') ownerId: string) {
    return this.canvasesService.findAllByOwner(ownerId);
  }

  @Query(() => Canvas, { name: 'canvas', nullable: true })
  async getCanvasById(@Args('id', { type: () => ID }) id: string) {
    return this.canvasesService.findOne(id);
  }

  @Mutation(() => Canvas)
  @UseGuards(AuthGuard)
  async createCanvas(
    @Args('name') name: string,
    @CurrentUser() user: UserPayload,
  ) {
    const ownerName = user.name || user.email || 'Unknown User';
    return this.canvasesService.create(name, user.id, ownerName);
  }

  @Mutation(() => Canvas)
  @UseGuards(AuthGuard)
  async updateCanvas(
    @Args('updateCanvasInput') updateCanvasInput: UpdateCanvasInput,
  ) {
    return this.canvasesService.update(updateCanvasInput.id, updateCanvasInput);
  }

  @Mutation(() => Canvas, { nullable: true })
  @UseGuards(AuthGuard)
  async removeCanvas(@Args('id', { type: () => ID }) id: string) {
    return this.canvasesService.remove(id);
  }

  @Query(() => [Canvas], { name: 'myCollaboratingCanvases' })
  @UseGuards(AuthGuard)
  async myCollaboratingCanvases(@CurrentUser() user: UserPayload) {
    return this.canvasesService.findCanvasesWhereUserIsCollaborator(user.id);
  }

  @Mutation(() => MutationResponse)
  @UseGuards(AuthGuard)
  async removeCollaborator(
    @Args('canvasId', { type: () => ID }) canvasId: string,
    @Args('userId', { type: () => ID }) userId: string,
    @CurrentUser() user: UserPayload
  ) {
    await this.canvasesService.removeCollaborator(canvasId, user.id, userId);
    return { success: true, message: 'Collaborator removed successfully.' };
  }

  @Mutation(() => MutationResponse)
  @UseGuards(AuthGuard)
  async leaveCanvas(
    @Args('canvasId', { type: () => ID }) canvasId: string,
    @CurrentUser() user: UserPayload
  ) {
    await this.canvasesService.leaveCanvas(canvasId, user.id);
    return { success: true, message: 'You have left the canvas.' };
  }
}