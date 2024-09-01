import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import {
  FIREBASE_EMAIL,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_PROJECT_ID,
  GOOGLE_APPLICATION_CREDENTIALS,
  PORT,
} from './app.constants';
import { HttpErrorFilter } from './middleware/HttpErrorFilter';
import { Credential, initializeApp } from 'firebase-admin/app';
import admin from 'firebase-admin';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import 'winston-daily-rotate-file';
import * as winston from 'winston';

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

const getFirebaseCredential = (configService: ConfigService): Credential => {
  if (configService.get(GOOGLE_APPLICATION_CREDENTIALS)) {
    return admin.credential.applicationDefault();
  } else if (configService.get(FIREBASE_PRIVATE_KEY)) {
    return admin.credential.cert({
      projectId: configService.get(FIREBASE_PROJECT_ID),
      clientEmail: configService.get(FIREBASE_EMAIL),
      privateKey: configService.get(FIREBASE_PRIVATE_KEY),
    });
  } else {
    throw new Error(
      'Unable to initialize App, cannot find firebase credentials',
    );
  }
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.DailyRotateFile({
          level: 'info',
          filename: 'logs/application-%DATE%.log',
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
  });
  const configService = app.get<ConfigService>(ConfigService);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalFilters(new HttpErrorFilter());
  const credential: Credential = getFirebaseCredential(configService);
  initializeApp({
    credential,
  });
  await app.listen(configService.get(PORT));
}

bootstrap();
