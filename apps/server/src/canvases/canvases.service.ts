import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Canvas } from './schemas/canvas.schema';


@Injectable()
export class CanvasesService {
  constructor(
    @InjectModel(Canvas.name) private canvasModel: Model<Canvas>,
  ){
    console.log('CanvasesService initialized and ready for MongoDB!');
  }

  async create(name: string, ownerId: string): Promise<Canvas>{
    const newCanvas = new this.canvasModel({ name,ownerId});
    return newCanvas.save();
  }

  async FindAllByOwner(ownerId: string): Promise<Canvas[]>{
    return this.canvasModel.find({ownerId}).exec();
  }

}