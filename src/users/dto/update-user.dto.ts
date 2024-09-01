import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @IsOptional()
  githubTokenId?: string;
  @IsString()
  @IsOptional()
  githubUserName?: string;
  @IsString()
  @IsOptional()
  githubToken?: string;
}
