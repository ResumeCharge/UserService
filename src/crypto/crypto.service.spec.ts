import { CryptoService } from './crypto.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

jest.mock('@nestjs/config');

describe('CryptoService', () => {
  let cryptoService: CryptoService;
  let configService: ConfigService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptoService, ConfigService],
    }).compile();
    configService = module.get<ConfigService>(ConfigService);
    cryptoService = module.get<CryptoService>(CryptoService);
  });
  it('shouldEncryptAndDecryptTokens', async () => {
    jest.spyOn(configService, 'get').mockImplementation(() => 'password');
    const plainText = 'hello world!';
    const encrypted = await cryptoService.encrypt('hello world!');
    const decrypted = await cryptoService.decrypt(
      encrypted.value,
      encrypted.iv,
    );
    expect(decrypted).toBe(plainText);
  });
});
