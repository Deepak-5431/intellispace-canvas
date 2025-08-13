import { Module } from '@nestjs/common';
import { CanvasesService } from './canvases.service';

@Module({
  providers: [CanvasesService]
})
export class CanvasesModule {}
