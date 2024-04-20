import {
  getTokenFromExecutionContext,
  getUserIdFromAuthToken,
  isValidRequest,
} from './auth.helpers';
import { ExecutionContext } from '@nestjs/common';
import admin from 'firebase-admin';

jest.mock('firebase-admin');

describe('AuthHelper', () => {
  const VALID_TOKEN = 'VALID_TOKEN';
  const INVALID_TOKEN = '';

  it('shouldReturnTheUserIdWhenCalledWithAValidToken', async () => {
    admin.auth = jest.fn().mockImplementation(() => {
      return {
        verifyIdToken: () => {
          return new Promise((resolve) => {
            resolve({ uid: '123' });
          });
        },
      };
    });
    const uid = await getUserIdFromAuthToken(VALID_TOKEN);
    expect(uid).toBe('123');
  });

  it('shouldThrowAnExceptionWhenTheTokenIsInvalid', async () => {
    admin.auth = jest.fn().mockImplementation(() => {
      return {
        verifyIdToken: () => {
          return new Promise((resolve, reject) => {
            reject(new Error('expected'));
          });
        },
      };
    });
    try {
      await getUserIdFromAuthToken(VALID_TOKEN);
      expect(false).toBeTruthy();
    } catch (e) {}
  });

  it('shouldReturnTrueWhenTheRequestIsValid', async () => {
    const executionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization: VALID_TOKEN } }),
      }),
    };
    const valid = isValidRequest(executionContext as ExecutionContext);
    expect(valid).toBe(true);
  });

  it('shouldReturnFalseWhenTheTokenIsEmpty', async () => {
    const executionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization: INVALID_TOKEN } }),
      }),
    };
    const valid = isValidRequest(executionContext as ExecutionContext);
    expect(valid).toBe(false);
  });

  it('shouldReturnFalseWhenTheTokenIsNull', async () => {
    const executionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization: null } }),
      }),
    };
    const valid = isValidRequest(executionContext as ExecutionContext);
    expect(valid).toBe(false);
  });

  it('shouldReturnFalseWhenTheContextIsNull', async () => {
    const valid = isValidRequest(null);
    expect(valid).toBe(false);
  });

  it('shouldReturnTokenWhenTokenIsValid', async () => {
    const executionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization: 'Bearer token' } }),
      }),
    };
    const token = getTokenFromExecutionContext(
      executionContext as ExecutionContext,
    );
    expect(token).toBe('token');
  });

  it('shouldThrowErrorWhenContextIsNull', async () => {
    const action = async () => {
      getTokenFromExecutionContext(null);
    };
    await expect(action()).rejects.toThrow(Error);
  });

  it('shouldThrowErrorWhenAuthorizationHeaderIsNull', async () => {
    const executionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: null }),
      }),
    };
    const action = async () => {
      getTokenFromExecutionContext(executionContext as ExecutionContext);
    };
    await expect(action()).rejects.toThrow(Error);
  });

  it('shouldThrowErrorWhenAuthorizationHeaderMissingArguments', async () => {
    const executionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization: 'Bearer' } }),
      }),
    };
    const action = () => {
      getTokenFromExecutionContext(executionContext as ExecutionContext);
    };
    expect(action).toThrow(Error);
    expect(action).toThrow(
      'Authorization header is invalid, expected length to be 2 but was 1',
    );
  });

  it('shouldThrowErrorWhenAuthorizationHeaderIsInvalid', async () => {
    const executionContext = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization: 'Invalid Invalid' } }),
      }),
    };
    const action = () => {
      getTokenFromExecutionContext(executionContext as ExecutionContext);
    };
    expect(action).toThrow(Error);
    expect(action).toThrow(
      'Authorization header is invalid, expected first part to be "Bearer" but was Invalid',
    );
  });
});
