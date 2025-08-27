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

  async create(name: string, ownerId: string, ownerName: string): Promise<Canvas>{
    const newCanvas = new this.canvasModel({ name,ownerId,ownerName});
    return newCanvas.save();
  }

  async findAllByOwner(ownerId: string): Promise<Canvas[]>{
    return this.canvasModel.find({ownerId}).exec();
  }
  
 
  async update(
    id: string,
    updateData: {name?: string; canvasData?: string},
  ):Promise<Canvas|null>{
     return this.canvasModel.findByIdAndUpdate(id,updateData,{new:true}).exec();
  }
  
  async remove(id: string) : Promise<Canvas | null>{
    return this.canvasModel.findByIdAndDelete(id).exec();
  }


  async findOne(id: string) : Promise<Canvas | null>{
    return this.canvasModel.findById(id).exec();
  }
}