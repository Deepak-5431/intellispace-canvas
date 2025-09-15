import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Invitation,InvitationSchema } from './schemas/invitation.schema';
import { InvitationsService } from './invitations.service';
import { InvitationsResolver } from './invitations.resolver';
import { CanvasesModule } from 'src/canvases/canvases.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports:[
    MongooseModule.forFeature([
      {name: Invitation.name, schema: InvitationSchema},
    ]),
    CanvasesModule,
    AuthModule,
    UsersModule,
  ],
  providers:[InvitationsService,InvitationsResolver],
  exports: [ InvitationsService],
})
export class InvitationsModule {}
