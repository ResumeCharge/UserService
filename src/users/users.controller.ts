import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/token')
  async token(@Param('id') userId: string) {
    return await this.usersService.getTokenForUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/validToken')
  async hasValidToken(@Param('id') userId: string) {
    return await this.usersService.hasValidToken(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/code')
  async getTokenFromCodeAndSaveToUser(
    @Param('id') userId: string,
    @Body() body: { code: string },
  ) {
    return await this.usersService.getTokenFromCodeAndSave(userId, body.code);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @Header('Cache-Control', 'private, max-age=10')
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.usersService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/githubUsername')
  async getGithubUsernameFromToken(@Param('id') id: string) {
    return await this.usersService.getGithubUsername(id);
  }
}
