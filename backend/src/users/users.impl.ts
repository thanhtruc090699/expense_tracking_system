import {
	Injectable,
	BadRequestException,
	ConflictException,
	NotFoundException
} from '@nestjs/common';

import type { CreateUserDto, UpdateUserDto, User } from '../generated/models';
import { UsersApi } from '../generated/api/UsersApi';
import { UsersService } from './users.service';

@Injectable()
export class UsersApiImpl extends UsersApi {
	constructor(private readonly usersService: UsersService) {
		super(); // Call constructor of the generated class.
	}

	// Will return User promise
	async createUser(createUserDto: CreateUserDto,
			 request: Request): Promise<User> {

		if (!createUserDto.email) {
			throw new BadRequestException('Email is required');
		}

		// Extract user from the request.
		const authUser = request['user'] as {
			id: string;
			keycloakId: string
		};

		try {
			// This will get passed to the user service.
			const data = {
				email: createUserDto.email,
				username: createUserDto.username,
				currency: createUserDto.currency,
				userAvatar: createUserDto.userAvatar,
				// Append keycloak id before passing to service.
				keycloakId: authUser.keycloakId,
			};

			const user = await this.usersService.create(data);
			return this.toUser(user); // User created successfully.

		} catch (error: any) {
			if (error instanceof BadRequestException ||
			    error instanceof ConflictException) {
				// Re-throw exceptions caught in the service.
				throw error;
			}
			// Wrap unexpected errors in a 400 response.
			throw new BadRequestException("Error while creating user");
		}
	}

	async findAllUsers(): Promise<User[]> {
		const users = await this.usersService.findAll();
		return users.map((u) => this.toUser(u));
	}

	async findOneUser(id: string): Promise<User> {
		try {
			const user = await this.usersService.findOne(id);
			return this.toUser(user); // User found successfully.

		} catch (error: any) {
			if (error instanceof NotFoundException)
				throw error; // Re-throw exception from service.

			// Throw 400.
			throw new BadRequestException("Error while fetching user");
		}
	}

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
	  try {
		  const user = await this.usersService.update(id, updateUserDto);
		  return this.toUser(user); // User updated successfully.

	  } catch (error: any) {
		  if (error instanceof ConflictException ||
		     			NotFoundException) {
			  throw error; // Re-throw exception from service.
		  }

		  // Throw 400.
		  throw new BadRequestException("Error while updating user");
	  }
  }

  async deleteUser(id: string): Promise<User> {
	  try {
		  const user = await this.usersService.delete(id);
		  return this.toUser(user); // User deleted successfully.

	  } catch (error : any) {
		  if (error instanceof NotFoundException)
			  throw error; // Re-throw error from service.

		  // Throw 400.
		  throw new BadRequestException("Error while deleting user");
	  }
  }

  private toUser(user: any): User {
	  // More transformations can be added here.
	  return {
		  ...user, // Copy all properties from the input.
		  // Override Date() returned from prisma to ISO string.
		  createdAt: user.createdAt.toISOString(),
	  };
  }

}

