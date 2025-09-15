import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CanvasesService } from './canvases.service';
import { CanvasesResolver } from './canvases.resolver';
import { Canvas,CanvasSchema } from './schemas/canvas.schema';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports:[
    MongooseModule.forFeature([{ name: Canvas.name, schema: CanvasSchema}]),
    AuthModule,
    UsersModule,
  ],
  providers: [CanvasesService, CanvasesResolver],
  exports: [CanvasesService],
})
export class CanvasesModule {}
