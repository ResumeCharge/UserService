import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @IsOptional()
  githubTokenId: string;
  @IsString()
  @IsOptional()
  githubUserName: string;
  @IsBoolean()
  @IsOptional()
  isEmailVerified?: boolean;
}
