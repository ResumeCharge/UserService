//do not change this import, jest does not like absolute for this one
import admin from 'firebase-admin';
import { ExecutionContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GENERATOR_SERVICE_CLIENT_ID,
  GENERATOR_SERVICE_CLIENT_SECRET,
} from '../app.constants';

const logger = new Logger();

export const isValidIdToken = async (token: string): Promise<boolean> => {
  const auth = admin.auth();
  return await auth
    .verifyIdToken(token)
    .then(() => {
      return true;
    })
    .catch((err) => {
      logger.warn('Caught exception trying to verify id token', err);
      return false;
    });
};

export const getUserIdFromAuthToken = async (
  token: string,
): Promise<string> => {
  const auth = admin.auth();
  return await auth
    .verifyIdToken(token)
    .then((decodedToken) => {
      return decodedToken.uid;
    })
    .catch((err) => {
      logger.warn('Caught exception trying to verify id token', err);
      throw err;
    });
};

export const isValidRequest = (executionContext: ExecutionContext): boolean => {
  try {
    const token = executionContext.switchToHttp().getRequest()
      .headers.authorization;
    if (typeof token === 'undefined' || token == null) return false;
    return token.trim().length >= 1;
  } catch (exception) {
    return false;
  }
};

export const getTokenFromExecutionContext = (
  executionContext: ExecutionContext,
): string => {
  const authorizationHeader = executionContext.switchToHttp().getRequest()
    .headers.authorization;
  const authorizationHeaderParts = authorizationHeader.split(' ');
  if (authorizationHeaderParts.length != 2) {
    throw new Error(
      'Authorization header is invalid, expected length to be 2 but was ' +
        authorizationHeaderParts.length,
    );
  }
  if (authorizationHeaderParts[0] !== 'Bearer') {
    throw new Error(
      'Authorization header is invalid, expected first part to be "Bearer" but was ' +
        authorizationHeaderParts[0],
    );
  }
  return authorizationHeaderParts[1];
};

export const isLocalHost = (executionContext: ExecutionContext): boolean => {
  const headers = executionContext.switchToHttp().getRequest().headers;
  const xForwardedFor = headers['x-forwarded-for'];
  return xForwardedFor === '127.0.0.1';
};

export const isValidClientSecret = (
  executionContext: ExecutionContext,
  configService: ConfigService,
): boolean => {
  const generatorServiceClientId = configService.get<string>(
    GENERATOR_SERVICE_CLIENT_ID,
  );
  const generatorServiceClientSecret = configService.get<string>(
    GENERATOR_SERVICE_CLIENT_SECRET,
  );
  if (!generatorServiceClientSecret || !generatorServiceClientId) {
    return false;
  }
  const headers = executionContext.switchToHttp().getRequest().headers;
  const clientSecret = headers['client_secret'];
  const clientId = headers['client_id'];
  if (!clientSecret || !clientId) {
    return false;
  }
  return (
    generatorServiceClientId === clientId &&
    generatorServiceClientSecret === clientSecret
  );
};
