
import { UseGuards } from '@nestjs/common';
import { Resolver,Mutation,Args,ObjectType,Field,ID,Query, InputType } from '@nestjs/graphql';
import { CanvasesService } from './canvases.service';
import { AuthGuard } from 'src/auth/auth.guard';


@ObjectType()
class Canvas{
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  ownerId: string;

  @Field({ nullable:true })
  canvasData? : string;
}


@InputType()
class UpdateCanvasInput{
  @Field(() => ID)
  id: string;

  @Field({nullable:true})
  name?: string;

  @Field({nullable:true})
  canvasData?: string;
}



@Resolver(() => Canvas)
export class CanvasesResolver {
  constructor( private readonly canvasesService: CanvasesService) {}
  
  @Query(()=> String)
  sayHello(): string {
    return 'Hello World!';
  }

  @Query(() => [Canvas],{name: 'canvases'}) 
  @UseGuards(AuthGuard)
  async getCanvasesByOwner(@Args('ownerId') ownerId: string){
    return this.canvasesService.findAllByOwner(ownerId);
  }


  @Query(()=> Canvas, { name: 'canvas', nullable:true})
  async getCanvasById(@Args('id',{type: ()=> ID}) id: string){
   return this.canvasesService.findOne(id);
  }

  @Mutation(() => Canvas)
  @UseGuards(AuthGuard)
  async createCanvas(
    @Args('name') name: string,
    @Args('ownerId') ownerId: string,
  ){
    return this.canvasesService.create(name, ownerId);
  }


@Mutation(()=> Canvas)
@UseGuards(AuthGuard)
async updateCanvas(
   @Args('updateCanvasInput') updateCanvasInput : UpdateCanvasInput,
){
  return this.canvasesService.update(updateCanvasInput.id, updateCanvasInput);
}


  @Mutation(() => Canvas, { nullable: true })
  @UseGuards(AuthGuard)
  async removeCanvas(@Args('id', { type: () => ID }) id: string) {
    return this.canvasesService.remove(id);
  }
}