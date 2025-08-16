import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Client,Account } from 'node-appwrite';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate( context: ExecutionContext):  Promise<boolean>  {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext().req;

    const jwt = request.headers.authorization?.split(' ')[1];
    if(!jwt){
      return false;
    }

    try{
      const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT!)
      .setProject(process.env.APPWRITE_PROJECT_ID!)
      .setJWT(jwt);

      const account = new Account(client);
      await account.get();
      
      return true;
    }catch(error){
      return false;
    }
  }
}
