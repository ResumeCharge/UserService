import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [CryptoService, ConfigService],
  exports: [CryptoService],
})
export class CryptoModule {}
