import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GithubService } from '../github/github.service';
import { CryptoService } from '../crypto/crypto.service';
import { User } from './entities/user.entity';
import { InsertResult, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EncryptedToken } from '../crypto/entity/encryptedToken.entity';
import { STANDALONE_USER_ID } from '../app.constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(EncryptedToken)
    private encryptedTokenRepository: Repository<EncryptedToken>,
    private githubService: GithubService,
    private cryptoService: CryptoService,
    private readonly logger: Logger,
  ) {}

  // Create the standalone user if they don't exist
  async onModuleInit(): Promise<void> {
    const user = await this.usersRepository.findOneBy({
      userId: STANDALONE_USER_ID,
    });
    if (user) {
      return;
    }
    const createUserDto = new CreateUserDto();
    createUserDto.userId = STANDALONE_USER_ID;
    await this.usersRepository.insert(createUserDto);
  }

  async create(createUserDto: CreateUserDto): Promise<InsertResult> {
    return await this.usersRepository.insert(createUserDto);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(userId: string): Promise<User> {
    return this.usersRepository.findOneBy({ userId });
  }

  async update(userId: string, updateUserDto: UpdateUserDto) {
    try {
      if (updateUserDto.githubToken) {
        await this.handleToken(userId, updateUserDto.githubToken);
        delete updateUserDto.githubToken;
      }
      if (Object.keys(updateUserDto).length == 0) {
        return this.usersRepository.findOneBy({ userId });
      }
      return await this.usersRepository.update(userId, updateUserDto);
    } catch (exception) {
      return this.handleUpdateUserException(exception);
    }
  }

  async remove(userId: string) {
    return await this.usersRepository.delete({ userId });
  }

  async getTokenForUser(userId: string) {
    const token = await this.encryptedTokenRepository.findOneBy({ userId });
    if (!token || !token.value) {
      throw new NotFoundException('Token for user not found');
    }
    /*type of value.buffer is ArrayBufferLike, but crypto service needs Buffer.
    Suppressing the warning seems to work fine, but it is unknown if this is actually ok
    or if it will break eventually. Should look into possibly casting the value to Buffer
    or creating a Buffer object from the value.*/
    const decryptedToken = await this.cryptoService.decrypt(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      token.value,
      token.iv,
    );
    if (await this.githubService.isTokenValid(decryptedToken)) {
      return decryptedToken;
    } else {
      throw new NotFoundException('User does not have valid token');
    }
  }

  async saveToken(userId: string, token: string) {
    const isValid = await this.githubService.isTokenValid(token);
    if (!isValid) {
      throw new BadRequestException('Token retrieved using code was invalid');
    }
    const githubUserName = await this.githubService.getGithubUsernameFromToken(
      token,
    );
    if (!githubUserName) {
      throw new BadRequestException('Could not get GitHub username from token');
    }
    const encryptedTokenObject = await this.cryptoService.encrypt(token);
    const savedToken = await this.encryptedTokenRepository.insert({
      userId,
      iv: encryptedTokenObject.iv,
      value: encryptedTokenObject.value,
    });
    const insertedTokenRowId = savedToken.raw[0]?.id;
    if (!insertedTokenRowId) {
      throw new InternalServerErrorException('Error saving token to user');
    }
    const updateUserDto: UpdateUserDto = {
      githubTokenId: insertedTokenRowId,
      githubUserName: githubUserName,
    };
    await this.usersRepository.update(userId, updateUserDto);
  }

  async handleToken(userId: string, token: string) {
    const isValid = await this.githubService.isTokenValid(token);
    if (!isValid) {
      throw new BadRequestException('Token retrieved using code was invalid');
    }
    const dbTokenObject = await this.encryptedTokenRepository.findOneBy({
      userId,
    });
    if (dbTokenObject) {
      await this.updateToken(dbTokenObject, token);
    } else {
      await this.createToken(userId, token);
    }
  }

  async createToken(userId: string, token: string) {
    const isValid = await this.githubService.isTokenValid(token);
    if (!isValid) {
      throw new BadRequestException('Token retrieved using code was invalid');
    }
    const githubUserName = await this.githubService.getGithubUsernameFromToken(
      token,
    );
    if (!githubUserName) {
      throw new BadRequestException('Could not get GitHub username from token');
    }
    const encryptedTokenObject = await this.cryptoService.encrypt(token);
    const savedToken = await this.encryptedTokenRepository.insert({
      userId,
      iv: encryptedTokenObject.iv,
      value: encryptedTokenObject.value,
    });
    const insertedTokenRowId = savedToken.raw[0]?.id;
    if (!insertedTokenRowId) {
      throw new InternalServerErrorException('Error saving token to user');
    }
    const updateUserDto: UpdateUserDto = {
      githubTokenId: insertedTokenRowId,
      githubUserName: githubUserName,
    };
    await this.usersRepository.update(userId, updateUserDto);
  }

  async updateToken(dbTokenObject: EncryptedToken, updateTokenString: string) {
    const githubUserName = await this.githubService.getGithubUsernameFromToken(
      updateTokenString,
    );
    const updatedEncryptedToken = await this.cryptoService.encrypt(
      updateTokenString,
    );
    await this.encryptedTokenRepository.update(dbTokenObject.id, {
      iv: updatedEncryptedToken.iv,
      value: updatedEncryptedToken.value,
    });
    const updateUserDto: UpdateUserDto = {
      githubUserName: githubUserName,
    };
    await this.usersRepository.update(STANDALONE_USER_ID, updateUserDto);
  }

  async hasValidToken(userId: string) {
    const token = await this.getTokenForUser(userId);
    return await this.githubService.isTokenValid(token);
  }

  async getGithubUsername(userId: string) {
    const token = await this.getTokenForUser(userId);
    return this.githubService.getGithubUsernameFromToken(token);
  }

  //TODO
  handleUpdateUserException(exception: any) {
    this.logger.error('Error updating user', exception);
  }
}
