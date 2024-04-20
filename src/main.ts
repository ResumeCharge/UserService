import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { PORT } from './app.constants';
import { HttpErrorFilter } from './middleware/HttpErrorFilter';
import { initializeApp } from 'firebase-admin/app';
import admin from 'firebase-admin';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  const configService = app.get<ConfigService>(ConfigService);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalFilters(new HttpErrorFilter());
  initializeApp({
    credential: admin.credential.applicationDefault(),
  });
  await app.listen(configService.get(PORT));
}
bootstrap();
