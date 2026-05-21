import {
  Inject,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { CreateUserDto, UpdateUserDto, User } from '../generated/models';
import { UsersApi } from '../generated/api/UsersApi';
import { USERS_API_PROVIDER } from './users.constants';
import { JwtGuard } from '../auth/jwt/jwt.guard';

@Controller('users')
@UseGuards(JwtGuard)
export class UsersController {
  constructor(
    @Inject(USERS_API_PROVIDER) private readonly usersApi: UsersApi,
  ) {}

  @Post()
  createUser(@Body() createUserDto: CreateUserDto, @Req() request: Request) {
    return this.usersApi.createUser(createUserDto, request);
  }

  @Get()
  findAllUsers(@Req() request: Request) {
    return this.usersApi.findAllUsers(request);
  }

  @Get(':id')
  findOneUser(@Param('id') id: string, @Req() request: Request) {
    return this.usersApi.findOneUser(id, request);
  }

  @Put(':id')
  updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: Request,
  ) {
    return this.usersApi.updateUser(id, updateUserDto, request);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string, @Req() request: Request) {
    return this.usersApi.deleteUser(id, request);
  }
}
