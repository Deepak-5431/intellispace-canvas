import { Resolver,Mutation,Args,ObjectType,Field,ID,Query } from '@nestjs/graphql';
import { CanvasesService } from './canvases.service';



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

  @Mutation(() => Canvas)
  async createCanvas(
    @Args('name') name: string,
    @Args('ownerId') ownerId: string,
  ){
    return this.canvasesService.create(name, ownerId);
  }
}
