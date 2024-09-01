import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { EncryptedToken } from '../crypto/entity/encryptedToken.entity';
import { Logger } from '@nestjs/common';
import { CryptoService } from '../crypto/crypto.service';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { GithubService } from '../github/github.service';
import { HttpModule } from '@nestjs/axios';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * Test everything we don't already cover in user.controller.spec.ts
 * **/
describe('UsersService', () => {
  let githubService: GithubService;
  let usersService: UsersService;
  let cryptoService: CryptoService;
  const mockUserRepository = {
    findOneBy: jest.fn(),
    save: jest.fn(),
    insert: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const mockTokenRepository = {
    createQueryBuilder: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        CryptoService,
        ConfigService,
        GithubService,
        Logger,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(EncryptedToken),
          useValue: mockTokenRepository,
        },
      ],
      imports: [HttpModule],
    }).compile();
    usersService = await module.resolve<UsersService>(UsersService);
    cryptoService = await module.resolve<CryptoService>(CryptoService);
    githubService = await module.resolve<GithubService>(GithubService);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should get a token and save it to the user', async () => {
    jest
      .spyOn(githubService, 'getOauthTokenFromCode')
      .mockResolvedValue('token');
    jest.spyOn(githubService, 'isTokenValid').mockResolvedValue(true);
    jest
      .spyOn(githubService, 'getGithubUsernameFromToken')
      .mockResolvedValue('username');
    jest
      .spyOn(cryptoService, 'encrypt')
      .mockResolvedValue({ value: randomBytes(16), iv: randomBytes(16) });
    jest
      .spyOn(mockTokenRepository, 'insert')
      .mockResolvedValue({ raw: [{ id: '1234' }] });
    await usersService.getTokenFromCodeAndSave('userId', 'code');
    expect(mockUserRepository.update).toBeCalled();
    expect(githubService.getOauthTokenFromCode).toBeCalled();
    expect(githubService.getGithubUsernameFromToken).toBeCalled();
    expect(cryptoService.encrypt).toBeCalled();
    expect(mockTokenRepository.insert).toBeCalled();
  });

  it('should update the user', async () => {
    const update: UpdateUserDto = {
      githubUserName: '',
      githubTokenId: '',
    };
    await usersService.update('userId', update);
    expect(mockUserRepository.update).toBeCalledWith('userId', update);
  });
});
