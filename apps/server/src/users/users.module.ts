// apps/server/src/users/users.module.ts
import { Module,forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersService } from './users.service'; 
import { UsersResolver } from './users.resolver'; 
import { MongoUsersService } from './mongo-users.service' 
import { User, UserSchema } from './schemas/user.schema'; 
import { AuthModule } from 'src/auth/auth.module';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => AuthModule), 
  ],
  providers: [UsersService, UsersResolver, MongoUsersService],
  exports: [MongoUsersService],
})
export class UsersModule {}