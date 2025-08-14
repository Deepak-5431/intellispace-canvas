import { Prop,Schema,SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Canvas extends Document{
  @Prop({required: true })
  name: string;

  @Prop({required: true})
  ownerId: string;

  @Prop({type:String,required: false})
  canvasData? : string;
}

export const CanvasSchema = SchemaFactory.createForClass(Canvas);