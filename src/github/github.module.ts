import { Logger, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { GithubService } from './github.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [GithubService, Logger],
  exports: [GithubService],
})
export class GithubModule {}
