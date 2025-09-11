// apps/server/src/auth/appwrite.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Account, Client } from 'node-appwrite';

export interface VerifiedAppwriteUser {
  appwriteUserId: string;
  email: string;
  name?: string;
}

@Injectable()
export class AppwriteService implements OnModuleInit {
  private readonly logger = new Logger(AppwriteService.name);
  private baseClient: Client;
  
  private appwriteEndpoint!: string; 
  private appwriteProjectId!: string; 
  private appwriteApiKey?: string; 

  constructor(private configService: ConfigService) {
    this.baseClient = new Client();
  }

  onModuleInit() {
    this.appwriteEndpoint = this.configService.getOrThrow<string>('APPWRITE_ENDPOINT');
    this.appwriteProjectId = this.configService.getOrThrow<string>('APPWRITE_PROJECT_ID');
    
    this.appwriteApiKey = this.configService.get<string>('APPWRITE_API_KEY');

    this.baseClient
      .setEndpoint(this.appwriteEndpoint)
      .setProject(this.appwriteProjectId);

    if (this.appwriteApiKey) {
      this.baseClient.setKey(this.appwriteApiKey);
    }
  }

  async verifyJWT(jwt: string): Promise<VerifiedAppwriteUser | null> {
    try {
      const tempClient = new Client()
        .setEndpoint(this.appwriteEndpoint) 
        .setProject(this.appwriteProjectId) 
        .setJWT(jwt);

      const tempAccount = new Account(tempClient);
      const user = await tempAccount.get();

      return {
        appwriteUserId: user.$id,
        email: user.email,
        name: user.name,
      };
    } catch (error: any) {
      this.logger.debug(`JWT verification failed: ${error.message}`);
      return null;
    }
  }
}