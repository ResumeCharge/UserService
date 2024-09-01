import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { SECRET_KEY } from '../app.constants';
import { promisify } from 'util';
import { EncryptedTokenObject } from './crypto.interface';

@Injectable()
export class CryptoService {
  constructor(private readonly configService: ConfigService) {}

  encrypt = async (value: string) => {
    const iv = randomBytes(16);

    const password = this.configService.get(SECRET_KEY);

    // The key length is dependent on the algorithm.
    // In this case for aes256, it is 32 bytes.
    const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
    const cipher = createCipheriv('aes-256-ctr', key, iv);
    const encryptedTokenObject: EncryptedTokenObject = {
      value: Buffer.concat([cipher.update(value), cipher.final()]),
      iv,
    };
    return encryptedTokenObject;
  };

  decrypt = async (encryptedText: Buffer, iv: Buffer) => {
    const password = this.configService.get(SECRET_KEY);
    const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
    const decipher = createDecipheriv('aes-256-ctr', key, iv);
    return Buffer.concat([
      decipher.update(encryptedText),
      decipher.final(),
    ]).toString();
  };
}
