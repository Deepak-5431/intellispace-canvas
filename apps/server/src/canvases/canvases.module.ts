import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CanvasesService } from './canvases.service';
import { CanvasesResolver } from './canvases.resolver';
import { Canvas,CanvasSchema } from './schemas/canvas.schema';

@Module({
  imports:[
    MongooseModule.forFeature([{ name: Canvas.name, schema: CanvasSchema}]),
  ],
  providers: [CanvasesService, CanvasesResolver]
})
export class CanvasesModule {}
