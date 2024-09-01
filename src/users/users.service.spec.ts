import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { EncryptedToken } from '../crypto/entity/encryptedToken.entity';
import { Logger } from '@nestjs/common';
import { CryptoService } from '../crypto/crypto.service';
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

  it('should update the user', async () => {
    const update: UpdateUserDto = {
      githubUserName: '',
      githubTokenId: '',
    };
    await usersService.update('userId', update);
    expect(mockUserRepository.update).toBeCalledWith('userId', update);
  });
});
