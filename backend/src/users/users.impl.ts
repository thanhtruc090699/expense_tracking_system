import { Injectable } from '@nestjs/common';
import type { User, CreateUserDto, DeleteBill200Response } from '../generated/models';
import { UsersApi } from '../generated/api/UsersApi';
import { UsersService } from './users.service';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  roles: string[];
}

@Injectable()
export class UsersApiImpl extends UsersApi {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  async createUser(createUserDto: CreateUserDto, request: Request): Promise<User> {
    const user = await this.usersService.create({
      email: createUserDto.email,
      password: createUserDto.password,
      username: createUserDto.username,
    });
    return this.toUser(user);
  }

  async findAllUsers(request: Request): Promise<User[]> {
    const users = await this.usersService.findAll();
    return users.map(u => this.toUser(u));
  }

  async findOneUser(id: string, request: Request): Promise<User> {
    const user = await this.usersService.findOne(id);
    return this.toUser(user);
  }

  async deleteUser(id: string, request: Request): Promise<DeleteBill200Response> {
    await this.usersService.delete(id);
    return { message: 'User deleted successfully' };
  }

  private toUser(dbUser: any): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      password: dbUser.password || '',
      username: dbUser.username || undefined,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
    };
  }
}
