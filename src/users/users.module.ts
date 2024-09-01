import { Logger, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { HttpModule } from '@nestjs/axios';
import { GithubModule } from '../github/github.module';
import { CryptoModule } from '../crypto/crypto.module';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncryptedToken } from '../crypto/entity/encryptedToken.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, EncryptedToken]),
    HttpModule,
    GithubModule,
    CryptoModule,
  ],
  exports: [UsersService],
  controllers: [UsersController],
  providers: [UsersService, Logger],
})
export class UsersModule {}
