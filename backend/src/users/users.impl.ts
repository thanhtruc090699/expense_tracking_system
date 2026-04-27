import { Injectable } from '@nestjs/common';
import type { User, CreateUserDto, UpdateUserDto, DeleteUser200Response } from '../generated/models';
import { UsersApi } from '../generated/api/UsersApi';
import { UsersService } from './users.service';

@Injectable()
export class UsersApiImpl extends UsersApi {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  async createUser(createUserDto: CreateUserDto, request: Request): Promise<User> {
    const authUser = request['user'] as { id: string };
    const data = {
      email: createUserDto.email,
      username: createUserDto.username,
      currency: createUserDto.currency,
      userAvatar: createUserDto.userAvatar,
      keycloakId: authUser.id,
    };
    const user = await this.usersService.create(data);
    return this.toUser(user);
  }

  async findAllUsers(request: Request): Promise<User[]> {
    const users = await this.usersService.findAll();
    return users.map((u) => this.toUser(u));
  }

  async findOneUser(id: string): Promise<User> {
    const user = await this.usersService.findOne(id);
    return this.toUser(user);
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersService.update(id, updateUserDto);
    return this.toUser(user);
  }

  async deleteUser(id: string): Promise<DeleteUser200Response> {
    await this.usersService.delete(id);
    return { message: 'User deleted successfully' };
  }

  private toUser(user: any): User {
    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
