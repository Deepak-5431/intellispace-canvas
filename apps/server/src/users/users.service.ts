import { Injectable, InternalServerErrorException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Client, Users } from 'node-appwrite';
import { User } from './users.model';

@Injectable()
export class UsersService implements OnModuleInit {
  private client: Client;
  private users: Users;

  onModuleInit() {
    this.client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT!)
      .setProject(process.env.APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!)

    this.users = new Users(this.client);
  }

  async findAll(limit?: number, offset?: number, search?: string) {
    try {
      const queries: string[] = [];

      if (limit) {
        queries.push(`limit(${limit})`);
      }
      if (offset) {
        queries.push(`offset(${offset})`)
      }
      if (search) {
        queries.push(`search("${search}")`);
      }

      const userList = await this.users.list(queries);

      return {
        users: userList.users.map(user => ({
          id: user.$id,
          email: user.email
        })),
        total: userList.total
      };
    } catch (error) {
      if (error.code === 404) {
        throw new NotFoundException('user not found');
      }
      throw new InternalServerErrorException('failed to fetch users');
    }
  }

  async findOne(id: string): Promise<User | null> {
    try {
      const user = await this.users.get(id);
      return {
        id: user.$id,
        email: user.email
      };

    } catch (error) {
      if (error.code === 404) {
        return null;
      }
      throw error;
    }
  }
}


