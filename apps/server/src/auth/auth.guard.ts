// apps/server/src/auth/auth.guard.ts

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AppwriteService } from './appwrite.service';
import { MongoUsersService } from '../users/mongo-users.service';
import { UserDocument } from '../users/schemas/user.schema';

export interface AuthenticatedUser {
  appwriteId: string;
  email: string;
  name?: string;
  mongoId: string; // stringified Mongo ObjectId
}

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly appwriteService: AppwriteService,
    private readonly mongoUsersService: MongoUsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;

    const authHeader = request.headers.authorization;
    if (!authHeader) {
      this.logger.warn('No Authorization header found');
      throw new UnauthorizedException('Authentication token not provided.');
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      this.logger.warn('Malformed Authorization header');
      throw new UnauthorizedException(
        'Invalid authentication token format. Expected: Bearer <token>',
      );
    }

    try {
      const verifiedAppwriteUser =
        await this.appwriteService.verifyJWT(token);

      if (!verifiedAppwriteUser) {
        this.logger.warn(
          `JWT verification failed for token: ${token.substring(0, 15)}...`,
        );
        throw new UnauthorizedException(
          'Invalid or expired authentication token.',
        );
      }

      this.logger.debug(
        `Successfully verified Appwrite user: ${verifiedAppwriteUser.appwriteUserId}`,
      );

      const mongoUser: UserDocument =
        await this.mongoUsersService.findOrCreateFromAppwrite(
          verifiedAppwriteUser.appwriteUserId,
          verifiedAppwriteUser.email,
          verifiedAppwriteUser.name,
        );

      if (!mongoUser) {
        this.logger.error(
          `Failed to find/create MongoDB user for Appwrite ID: ${verifiedAppwriteUser.appwriteUserId}`,
        );
        throw new UnauthorizedException(
          'Could not retrieve or create user profile.',
        );
      }

      // Attach authenticated user to request
      request.user = {
        appwriteId: mongoUser.userId,
        email: mongoUser.email,
        name: mongoUser.name,
        mongoId: mongoUser._id.toString(), // ✅ no casting needed
      } as AuthenticatedUser;

      this.logger.debug(
        `Authentication successful for user: ${mongoUser.email} (MongoID: ${mongoUser._id.toString()})`,
      );

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        this.logger.warn(`Authentication rejected: ${error.message}`);
        throw error;
      }

      this.logger.error(
        `Unexpected authentication error: ${error.message}`,
        error.stack,
      );

      throw new UnauthorizedException(
        'Authentication failed. Please try again.',
      );
    }
  }
}
