// apps/server/src/auth/auth.module.ts

import { Module,forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; 
import { UsersModule } from '../users/users.module';
import { AuthGuard } from './auth.guard';
import { AppwriteService } from '../auth/appwrite.service';

@Module({
  imports: [
    
   forwardRef(() => UsersModule),
    HttpModule.register({
      timeout: 5000, 
      maxRedirects: 5, 
    }),
  ],
  providers: [
    
    AuthGuard,
    
    AppwriteService,
  ],
  exports: [
    
    AuthGuard,
    AppwriteService,
  ],
})
export class AuthModule {}