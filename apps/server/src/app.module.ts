import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver,ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CanvasesModule } from './canvases/canvases.module';
import { UsersModule } from './users/users.module';
import { YjsModule } from './yjs/yjs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true}),
    MongooseModule.forRoot(process.env.MONGO_URI!),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'apps/server/src/schema.gql'),
      sortSchema: true,
      context:({req}) => ({req}),
      playground: true,
    }),
    CanvasesModule,
    UsersModule,
    YjsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
