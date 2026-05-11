import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import type {
  User,
  CreateUserDto,
  UpdateUserDto,
  DeleteUser200Response,
} from '../generated/models';
import { UsersApi } from '../generated/api/UsersApi';
import { UsersService } from './users.service';

@Injectable()
export class UsersApiImpl extends UsersApi {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  async createUser(
    createUserDto: CreateUserDto,
    request: Request,
  ): Promise<User> {
    if (!createUserDto.email) {
      throw new BadRequestException('Email is required');
    }

    const authUser = request['user'] as { id: string; keycloakId: string };

    try {
      const data = {
        email: createUserDto.email,
        username: createUserDto.username,
        currency: createUserDto.currency,
        userAvatar: createUserDto.userAvatar,
        keycloakId: authUser.keycloakId,
      };
      const user = await this.usersService.create(data);
      return this.toUser(user);
    } catch (error: any) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException('Invalid user data');
    }
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
