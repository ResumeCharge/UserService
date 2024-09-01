import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CryptoModule } from './crypto/crypto.module';
import { GithubModule } from './github/github.module';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { EncryptedToken } from './crypto/entity/encryptedToken.entity';
import * as winston from 'winston';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import 'winston-daily-rotate-file';

const ENV = process.env.NODE_ENV;

const winstonConsoleOptions = {
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.ms(),
    nestWinstonModuleUtilities.format.nestLike('UserService', {
      colors: true,
      prettyPrint: true,
      processId: true,
      appName: true,
    }),
  ),
};

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
    WinstonModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transports: [
          new winston.transports.DailyRotateFile({
            level: 'info',
            filename: `${configService.get(
              'LOG_LOCATION',
              'logs/',
            )}/application-%DATE%.log`,
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            format: winston.format.combine(
              winston.format.timestamp(),
              winston.format.ms(),
              nestWinstonModuleUtilities.format.nestLike('UserService', {
                colors: false,
                prettyPrint: true,
                processId: true,
                appName: true,
              }),
            ),
          }),
          new winston.transports.Console(winstonConsoleOptions),
        ],
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
