import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  LoggerService,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

const GITHUB_TOKEN_ENDPOINT = 'https://api.github.com/';
const GITHUB_USER_ENDPOINT = 'https://api.github.com/user';
const OAUTH_HEADER_SCOPES = 'x-oauth-scopes';
const OAUTH_REPO_SCOPE = 'repo';

@Injectable()
export class GithubService {
  constructor(
    private readonly httpService: HttpService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
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
