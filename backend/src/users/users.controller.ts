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

import type { CreateUserDto, UpdateUserDto } from '../generated/models'; // DTOs.
import { UsersApi } from '../generated/api/UsersApi'; // Our implementation of generated funcs.
import { USERS_API_PROVIDER } from './users.constants'; // Needed for dependency injection.
import { JwtGuard } from '../auth/jwt/jwt.guard'; // Auth Guard.

@Controller('users')
@UseGuards(JwtGuard) // Apply auth check.
export class UsersController {
  constructor(
    // Dependency injection.
    // This allows controller to use our implementation
    // of functions generated from the OpenApi spec.
    @Inject(USERS_API_PROVIDER) private readonly usersApi: UsersApi,
  ) {}

  @Post()
  createUser(
    @Body() createUserDto: CreateUserDto, // Validate req body against generated dto.
    @Req() request: Request,
  ) {
    // Call our implementation.
    return this.usersApi.createUser(createUserDto, request);
  }

  @Get()
  findAllUsers(@Req() request: Request) {
    // Call our implementation.
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
