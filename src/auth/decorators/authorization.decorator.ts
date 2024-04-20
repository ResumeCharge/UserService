import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getUserIdFromAuthToken } from '../auth.helpers';

export const Authorization = createParamDecorator(
  async (value: any, context: ExecutionContext): Promise<AuthUser> => {
    const request = context.switchToHttp().getRequest().headers.authorization;
    const token = request.split(' ')[1];
    const userId = await getUserIdFromAuthToken(token);
    return {
      userId,
      token,
    };
  },
);

export interface AuthUser {
  userId: string;
  token: string;
}
