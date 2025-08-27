
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { jwtDecode } from 'jwt-decode';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const jwt = request.headers.authorization?.split(' ')[1];
    if (jwt) {
      const decoded: { userId: string } = jwtDecode(jwt);
      return { id: decoded.userId }; // We will return an object with the user's ID
    }
    return null;
  },
);