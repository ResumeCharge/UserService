import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CryptoModule } from './crypto/crypto.module';
import { GithubModule } from './github/github.module';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { EncryptedToken } from './crypto/entity/encryptedToken.entity';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    UsersModule,
    GithubModule,
    ConfigModule.forRoot({
      envFilePath: [
        '.env',
        `.env.${ENV != null ? ENV.toLowerCase() : 'development'}`,
      ],
      isGlobal: true,
    }),
    CryptoModule,
    GithubModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST'),
        port: +configService.get<string>('POSTGRES_PORT'),
        username: configService.get<string>('POSTGRES_USERNAME'),
        database: configService.get<string>('POSTGRES_DATABASE'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        entities: [User, EncryptedToken],
        ssl: false,
        synchronize: true,
      }),
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
