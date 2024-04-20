import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import {
  getTokenFromExecutionContext,
  isLocalHost,
  isValidClientSecret,
  isValidIdToken,
  isValidRequest,
} from './auth.helpers';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger: Logger;
  constructor(private readonly configService: ConfigService) {
    super();
    this.logger = new Logger();
  }

  /*Fallback to requiring JWT if no client secret is passed from local host*/
  async canActivate(context: ExecutionContext) {
    if (isLocalHost(context)) {
      if (isValidClientSecret(context, this.configService)) {
        return true;
      }
    }
    if (!isValidRequest(context)) {
      return false;
    }

    const token = getTokenFromExecutionContext(context);
    return await isValidIdToken(token);
  }
}
