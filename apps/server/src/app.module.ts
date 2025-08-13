import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CanvasesModule } from './canvases/canvases.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true}),
    CanvasesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
