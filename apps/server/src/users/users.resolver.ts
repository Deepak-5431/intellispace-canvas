import { Field, ObjectType, Query,Resolver,Args,Int,ID } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './users.model';
import { UseGuards,HttpException,HttpStatus,Logger } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';

@ObjectType()
export class UsersResponse{
  @Field(() => [User])
  users: User[];

  @Field(() => Int)
  total: number;

  @Field(() => Int,{nullable: true})
  limit?: number;

  @Field(() => Int,{ nullable: true})
  offset?: number;

  @Field(() => Boolean)
  hasMore: boolean;
}

@Resolver(() => User)
export class UsersResolver {
  private readonly logger = new Logger(UsersResolver.name);

  constructor(private readonly usersService: UsersService){}

  @Query(() => UsersResponse, { name:'users'})
  @UseGuards(AuthGuard)
  async findAll(
  @Args('limit',{type:() => Int, nullable: true}) limit?: number,
  @Args('offset',{type:() => Int, nullable: true}) offset?: number,
  @Args('search', {type: () => Int, nullable: true}) search?: string
  ){try{
    const result =  await this.usersService.findAll(limit, offset, search);

    return {
      users: result.users,
        total: result.total,
        limit: limit || null,
        offset: offset || null,
        hasMore: (offset || 0) + (limit || result.users.length) < result.total
    };
  }catch(error){
          this.logger.error(`Failed to fetch users: ${error.message}`);
      throw new HttpException(
        'Failed to fetch users',
        HttpStatus.INTERNAL_SERVER_ERROR);
  }

}
 @Query(()=> User, { name:'user', nullable: true})
 @UseGuards(AuthGuard)
  async findOne(@Args('id', { type: () => ID }) id: string) {
    try {
      const user = await this.usersService.findOne(id);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      this.logger.error(`Failed to fetch user ${id}: ${error.message}`);
      throw new HttpException(
        'Failed to fetch user',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
}
  

  }
