
import { UseGuards } from '@nestjs/common';
import { Resolver,Mutation,Args,ObjectType,Field,ID,Query } from '@nestjs/graphql';
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
    return this.canvasesService.FindAllByOwner(ownerId);
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
   @Args('id', { type: () => ID}) id: string,
   @Args('name') name: string,
){
  return this.canvasesService.update(id, name);
}


  @Mutation(() => Canvas, { nullable: true })
  @UseGuards(AuthGuard)
  async removeCanvas(@Args('id', { type: () => ID }) id: string) {
    return this.canvasesService.remove(id);
  }
}