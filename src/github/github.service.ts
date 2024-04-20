import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

const GITHUB_TOKEN_ENDPOINT = 'https://api.github.com/';
const GITHUB_USER_ENDPOINT = 'https://api.github.com/user';
const GITHUB_GET_TOKEN_FROM_CODE_ENDPOINT =
  'https://github.com/login/oauth/access_token';
const OAUTH_HEADER_SCOPES = 'x-oauth-scopes';
const OAUTH_REPO_SCOPE = 'repo';
const GITHUB_CLIENT_ID = 'GITHUB_CLIENT_ID';
const GITHUB_CLIENT_SECRET = 'GITHUB_CLIENT_SECRET';

@Injectable()
export class GithubService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {}
  async isTokenValid(token: string): Promise<boolean> {
    this.logger.log('Attempting to validate token');
    try {
      const response = await firstValueFrom(
        this.httpService.get(GITHUB_TOKEN_ENDPOINT, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }),
      );
      const tokenScopesHeaderValue = response.headers[OAUTH_HEADER_SCOPES];
      if (tokenScopesHeaderValue == null) {
        this.logger.error('Invalid token, scopes are null');
        return false;
      }
      const scopesFromHeader = tokenScopesHeaderValue.split(',');
      if (scopesFromHeader.length == 0) {
        this.logger.error('Invalid token, scopes are empty');
        return false;
      }
      const requiredScopes = scopesFromHeader.filter(
        (scope) => scope.trim().toLowerCase() === OAUTH_REPO_SCOPE,
      );
      if (requiredScopes.length === 0) {
        this.logger.error(
          'Expected to find valid scopes, but found none! Scopes found are: ' +
            scopesFromHeader,
        );
        return false;
      }
      return true;
    } catch (err) {
      this.logger.error('Error trying to validate token', err);
      return false;
    }
  }

  async getOauthTokenFromCode(code: string): Promise<string> {
    const client_id = this.configService.get(GITHUB_CLIENT_ID);
    const client_secret = this.configService.get(GITHUB_CLIENT_SECRET);
    const tokenResponse = await firstValueFrom(
      this.httpService.post(GITHUB_GET_TOKEN_FROM_CODE_ENDPOINT, {
        client_id,
        client_secret,
        code,
      }),
    );

    if (tokenResponse.data.startsWith('error')) {
      throw new BadRequestException(tokenResponse.data);
    }
    const tokenResponseData = tokenResponse.data;
    const parametersFromResponseData = tokenResponseData.split('&');
    const accessTokenParameter = parametersFromResponseData.filter(
      (parameter) => parameter.startsWith('access_token'),
    );
    if (accessTokenParameter.length !== 1) {
      throw new BadRequestException('Unable to get oauth token from code');
    }
    const accessTokenKeyValueArray = accessTokenParameter[0].split('=');
    if (
      accessTokenKeyValueArray.length !== 2 ||
      accessTokenKeyValueArray[0] !== 'access_token'
    ) {
      throw new BadRequestException('Unable to get oauth token from code');
    }
    return accessTokenKeyValueArray[1];
  }

  async getGithubUsernameFromToken(token: string): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(GITHUB_USER_ENDPOINT, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }),
      );
      if (response.status !== 200) {
        throw new InternalServerErrorException();
      }
      const responseData = response.data;
      if (!responseData) {
        return null;
      }
      return responseData['login'];
    } catch (e) {
      throw new BadRequestException('Unable to complete request');
    }
  }
}
