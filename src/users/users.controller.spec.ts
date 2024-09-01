import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { HttpModule } from '@nestjs/axios';
import { Logger, NotFoundException } from '@nestjs/common';
import { GithubService } from '../github/github.service';
import { CryptoService } from '../crypto/crypto.service';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { EncryptedToken } from '../crypto/entity/encryptedToken.entity';

describe('UsersController', () => {
  let usersController: UsersController;
  let githubService: GithubService;
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
    findOneBy: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersController,
        UsersService,
        GithubService,
        CryptoService,
        ConfigService,
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
    githubService = await module.resolve<GithubService>(GithubService);
    cryptoService = await module.resolve<CryptoService>(CryptoService);
    usersController = await module.resolve<UsersController>(UsersController);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should find all users', async () => {
    await usersController.findAll();
    expect(mockUserRepository.find).toBeCalled();
  });

  it('should find a single users', async () => {
    await usersController.findOne('userId');
    expect(mockUserRepository.findOneBy).toBeCalled();
  });
  it('should create a new user', async () => {
    await usersController.create({
      userId: 'userId',
    });
    expect(mockUserRepository.insert).toBeCalled();
  });

  it('should return the user token', async () => {
    jest
      .spyOn(mockTokenRepository, 'getOne')
      .mockResolvedValue({ value: '1234' });
    jest.spyOn(githubService, 'isTokenValid').mockResolvedValue(true);
    jest.spyOn(cryptoService, 'decrypt').mockResolvedValue('token!');
    jest
      .spyOn(mockTokenRepository, 'findOneBy')
      .mockResolvedValue({ value: 'token' });
    const token = await usersController.token('1234');
    expect(token).toBe('token!');
  });
  it('should return true if the user token is valid', async () => {
    jest
      .spyOn(mockTokenRepository, 'getOne')
      .mockResolvedValue({ value: '1234' });
    await setupTokenExpectations('1234', true);
    const isValid = await usersController.hasValidToken('1234');
    expect(isValid).toBeTruthy();
  });
  it('should throw an exception if the user token is invalid', async () => {
    jest
      .spyOn(mockTokenRepository, 'getOne')
      .mockResolvedValue({ value: '1234' });
    await setupTokenExpectations('1234', false);
    await expect(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      usersController.hasValidToken('1234'),
    ).rejects.toThrow(NotFoundException);
  });
  it('should return the github username', async () => {
    jest
      .spyOn(mockTokenRepository, 'getOne')
      .mockResolvedValue({ value: '1234' });
    await setupTokenExpectations('1234', true);
    jest
      .spyOn(githubService, 'getGithubUsernameFromToken')
      .mockResolvedValue('username');
    const userName = await usersController.getGithubUsernameFromToken('1234');
    expect(userName).toBe('username');
  });
  it('should throw an exception trying to get the user name if the token is invalid', async () => {
    jest
      .spyOn(mockTokenRepository, 'getOne')
      .mockResolvedValue({ value: '1234' });
    await setupTokenExpectations('1234', true);
    await setupTokenExpectations('1234', false);
    await expect(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      usersController.getGithubUsernameFromToken('1234'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should delete a user', async () => {
    await usersController.remove('1234');
    expect(mockUserRepository.delete).toBeCalled();
  });

  const setupTokenExpectations = async (userId: string, isValid: boolean) => {
    jest.spyOn(githubService, 'isTokenValid').mockResolvedValue(isValid);
    jest.spyOn(cryptoService, 'decrypt').mockResolvedValue('token!');
  };
});
