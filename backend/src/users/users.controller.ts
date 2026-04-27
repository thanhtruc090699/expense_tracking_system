import { Inject, Controller, Get, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import type { Observable } from 'rxjs';
import type { User, CreateUserDto, DeleteBill200Response } from '../generated/models';
import { UsersApi } from '../generated/api/UsersApi';
import { USERS_API_PROVIDER } from './users.constants';
import { JwtGuard } from '../auth/jwt/jwt.guard';

@Controller('users')
@UseGuards(JwtGuard)
export class UsersController {
  constructor(@Inject(USERS_API_PROVIDER) private readonly usersApi: UsersApi) {}

  @Post()
  createUser(@Body() createUserDto: CreateUserDto, @Req() request: Request): ReturnType<UsersApi['createUser']> {
    return this.usersApi.createUser(createUserDto, request);
  }

  @Get()
  findAllUsers(@Req() request: Request): ReturnType<UsersApi['findAllUsers']> {
    return this.usersApi.findAllUsers(request);
  }

  @Get(':id')
  findOneUser(@Param('id') id: string, @Req() request: Request): ReturnType<UsersApi['findOneUser']> {
    return this.usersApi.findOneUser(id, request);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string, @Req() request: Request): ReturnType<UsersApi['deleteUser']> {
    return this.usersApi.deleteUser(id, request);
  }
}
