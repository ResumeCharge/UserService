import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GithubService } from './github.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { BadRequestException, Logger } from '@nestjs/common';

describe('GithubService', () => {
  let githubService: GithubService;
  let configService: ConfigService;
  let httpService: HttpService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GithubService, ConfigService, Logger],
      imports: [HttpModule],
    }).compile();
    configService = module.get<ConfigService>(ConfigService);
    httpService = module.get<HttpService>(HttpService);
    githubService = module.get<GithubService>(GithubService);
  });
  it('shouldReturnTrueIfTheTokenIsValid', async () => {
    const headers = {
      'x-oauth-scopes': 'repo,admin',
    };
    const response: AxiosResponse<any> = {
      data: {},
      headers: headers,
      config: {} as any,
      status: 200,
      statusText: 'OK',
    };
    jest.spyOn(httpService, 'get').mockImplementation(() => of(response));
    const isValid = await githubService.isTokenValid('token');
    expect(isValid).toBeTruthy();
  });
  it('shouldReturnFalseIfTheTokenIsInvalid', async () => {
    const headers = {
      'x-oauth-scopes': '',
    };
    const response: AxiosResponse<any> = {
      data: {},
      headers: headers,
      config: {} as any,
      status: 200,
      statusText: 'OK',
    };
    jest.spyOn(httpService, 'get').mockImplementation(() => of(response));
    const isValid = await githubService.isTokenValid('token');
    expect(isValid).not.toBeTruthy();
  });
  it('shouldReturnFalseIfNoHeadersAreReturned', async () => {
    const headers = {};
    const response: AxiosResponse<any> = {
      data: {},
      headers: headers,
      config: {} as any,
      status: 200,
      statusText: 'OK',
    };
    jest.spyOn(httpService, 'get').mockImplementation(() => of(response));
    const isValid = await githubService.isTokenValid('token');
    expect(isValid).not.toBeTruthy();
  });
  it('shouldReturnFalseIfAnExceptionIsCaught', async () => {
    jest.spyOn(httpService, 'get').mockImplementation(() => {
      throw new Error();
    });
    const isValid = await githubService.isTokenValid('token');
    expect(isValid).not.toBeTruthy();
  });
  it('shouldReturnTheUsernameFromTheToken', async () => {
    const response: AxiosResponse<any> = {
      data: { login: 'username' },
      headers: {},
      config: {} as any,
      status: 200,
      statusText: 'OK',
    };
    jest.spyOn(httpService, 'get').mockImplementation(() => of(response));
    const username = await githubService.getGithubUsernameFromToken('token');
    expect(username).toBe('username');
  });
  it('shouldReturnUndefinedIfNoUsernameIsReturned', async () => {
    const response: AxiosResponse<any> = {
      data: {},
      headers: {},
      config: {} as any,
      status: 200,
      statusText: 'OK',
    };
    jest.spyOn(httpService, 'get').mockImplementation(() => of(response));
    const username = await githubService.getGithubUsernameFromToken('token');
    expect(username).toBeUndefined();
  });
  it('shouldThrowAnErrorIfTheRequestFails', async () => {
    jest.spyOn(httpService, 'get').mockImplementation(() => {
      throw new Error();
    });
    await expect(
      githubService.getGithubUsernameFromToken('token'),
    ).rejects.toThrow(BadRequestException);
  });
  it('shouldThrowAnErrorIfNot200Response', async () => {
    const response: AxiosResponse<any> = {
      data: {},
      headers: {},
      config: {} as any,
      status: 500,
      statusText: 'OK',
    };
    jest.spyOn(httpService, 'get').mockImplementation(() => of(response));
    await expect(
      githubService.getGithubUsernameFromToken('token'),
    ).rejects.toThrow(BadRequestException);
  });
});
