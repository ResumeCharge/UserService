import { JwtAuthGuard } from './jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import admin from 'firebase-admin';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

jest.mock('firebase-admin');
describe('JwtAuthGuard', () => {
  let jwtAuthGuard: JwtAuthGuard;
  let configService: ConfigService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService, JwtAuthGuard],
    }).compile();
    jwtAuthGuard = await module.resolve<JwtAuthGuard>(JwtAuthGuard);
    configService = await module.resolve<ConfigService>(ConfigService);
  });

  it('shouldNotAllowRequestsFromLocalHostWithoutAClientSecretOrClientId', async () => {
    const httpRequest = {
      headers: {
        'x-forwarded-for': '127.0.0.1',
      },
    };
    jest.spyOn(configService, 'get').mockReturnValue('config-value');
    const executionContext = getExecutionContext(httpRequest);
    const canActivate = await jwtAuthGuard.canActivate(executionContext);
    expect(canActivate).not.toBeTruthy();
  });

  it('shouldNotAllowRequestsFromLocalHostWithoutAClientSecret', async () => {
    const httpRequest = {
      headers: {
        'x-forwarded-for': '127.0.0.1',
        client_id: 'client_id',
      },
    };
    jest.spyOn(configService, 'get').mockReturnValue('config-value');
    const executionContext = getExecutionContext(httpRequest);
    const canActivate = await jwtAuthGuard.canActivate(executionContext);
    expect(canActivate).not.toBeTruthy();
  });

  it('shouldNotAllowRequestsFromLocalHostWithoutAClientId', async () => {
    const httpRequest = {
      headers: {
        'x-forwarded-for': '127.0.0.1',
        client_secret: 'client_secret',
      },
    };
    jest.spyOn(configService, 'get').mockReturnValue('config-value');
    const executionContext = getExecutionContext(httpRequest);
    const canActivate = await jwtAuthGuard.canActivate(executionContext);
    expect(canActivate).not.toBeTruthy();
  });

  it('shouldNotAllowRequestsFromLocalHostWithAnIncorrectClientSecret', async () => {
    const httpRequest = {
      headers: {
        'x-forwarded-for': '127.0.0.1',
        'client-secret': 'invalid',
      },
    };
    const executionContext = getExecutionContext(httpRequest);
    const canActivate = await jwtAuthGuard.canActivate(executionContext);
    expect(canActivate).not.toBeTruthy();
  });

  it('shouldAllowLocalHostRequest', async () => {
    const httpRequest = {
      headers: {
        'x-forwarded-for': '127.0.0.1',
        client_secret: 'client_secret',
        client_id: 'client_id',
      },
    };
    jest
      .spyOn(configService, 'get')
      .mockReturnValueOnce('client_id')
      .mockReturnValueOnce('client_secret');
    const executionContext = getExecutionContext(httpRequest);
    const canActivate = await jwtAuthGuard.canActivate(executionContext);
    expect(canActivate).toBeTruthy();
  });

  it('shouldAllowRequestsFromOtherOrigins', async () => {
    admin.auth = jest.fn().mockImplementation(() => {
      return {
        verifyIdToken: () => {
          return new Promise((resolve) => {
            resolve({});
          });
        },
      };
    });
    const httpRequest = {
      headers: {
        authorization: 'Bearer token',
      },
    };
    const executionContext = getExecutionContext(httpRequest);
    const canActivate = await jwtAuthGuard.canActivate(executionContext);
    expect(canActivate).toBeTruthy();
  });

  it('shouldBlockRequestsFromOtherOriginsWithoutAToken', async () => {
    const httpRequest = {
      headers: {},
    };
    const executionContext = getExecutionContext(httpRequest);
    const canActivate = await jwtAuthGuard.canActivate(executionContext);
    expect(canActivate).not.toBeTruthy();
  });

  it('shouldBlockRequestsFromOtherOriginsWithAnIncorrectTokenFormat', async () => {
    const httpRequest = {
      headers: {
        authorization: 'token',
      },
    };
    const executionContext = getExecutionContext(httpRequest);
    await expect(jwtAuthGuard.canActivate(executionContext)).rejects.toThrow(
      Error,
    );
  });

  it('shouldBlockRequestsFromOtherOriginsWithoutAnInvalidToken', async () => {
    admin.auth = jest.fn().mockImplementation(() => {
      return {
        verifyIdToken: () => {
          return new Promise((_, reject) => {
            reject('JWT token was invalid');
          });
        },
      };
    });
    const httpRequest = {
      headers: {
        authorization: 'Bearer token',
      },
    };
    const executionContext = getExecutionContext(httpRequest);
    const canActivate = await jwtAuthGuard.canActivate(executionContext);
    expect(canActivate).not.toBeTruthy();
  });

  const getExecutionContext = (httpRequest: any): ExecutionContext => {
    const httpArgumentsHost: HttpArgumentsHost = {
      getRequest: jest.fn(() => httpRequest) as any,
      getResponse: jest.fn(),
      getNext: jest.fn(),
    };
    return {
      getType: jest.fn(),
      getClass: jest.fn(),
      getHandler: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToHttp: jest.fn(() => httpArgumentsHost),
      switchToWs: jest.fn(),
    };
  };
});
