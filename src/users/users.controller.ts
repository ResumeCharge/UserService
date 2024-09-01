import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get(':id/token')
  async token(@Param('id') userId: string) {
    return await this.usersService.getTokenForUser(userId);
  }

  @Get(':id/validToken')
  async hasValidToken(@Param('id') userId: string) {
    return await this.usersService.hasValidToken(userId);
  }

  @Get(':id')
  @Header('Cache-Control', 'private, max-age=10')
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.usersService.remove(id);
  }

  @Get(':id/githubUsername')
  async getGithubUsernameFromToken(@Param('id') id: string) {
    return await this.usersService.getGithubUsername(id);
  }
}
