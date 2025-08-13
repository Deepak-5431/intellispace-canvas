// path: apps/server/src/canvases/canvases.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, Databases, ID, Permission, Role } from 'node-appwrite';

@Injectable()
export class CanvasesService implements OnModuleInit {
  private client: Client;
  private databases: Databases;
  
  // Define variables to hold our IDs
  private readonly databaseId = process.env.APPWRITE_DATABASE_ID!;
  private readonly collectionId = process.env.APPWRITE_COLLECTION_CANVASES_ID!;

  onModuleInit() {
    this.client = new Client();
    this.databases = new Databases(this.client);

    this.client
      .setEndpoint(process.env.APPWRITE_ENDPOINT!)
      .setProject(process.env.APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);

    console.log('appwrite running successfully');
  }

  async create(name: string, ownerId: string) {
    try {
      const newCanvas = await this.databases.createDocument(
        this.databaseId,    // Use the variable
        this.collectionId,  // Use the variable
        ID.unique(),
        {
          name,
          ownerId,
        },
        [
          Permission.read(Role.user(ownerId)),
          Permission.update(Role.user(ownerId)),
          Permission.delete(Role.user(ownerId)),
        ],
      );
      return newCanvas;
    } catch (error) {
      console.error('Failed to create canvas:', error);
      throw error;
    }
  }
}