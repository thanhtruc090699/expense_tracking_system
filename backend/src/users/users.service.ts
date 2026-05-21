import {
	Injectable,
	NotFoundException,
	ConflictException,
	BadRequestException,
} from '@nestjs/common';

import { prisma } from '../prisma';

@Injectable()
export class UsersService {

	async create(data: {
		keycloakId: string;
		email: string;
		username?: string;
		currency?: string;
		userAvatar?: string;
	}) {
		try {
			return await prisma.user.create({ data });
		} catch (error: any) {
			// Prisma error code
			if (error.code === 'P2002') {
				// Return 409
				throw new ConflictException(
					"User with this email or keycloak ID already exists",
				);
			}

			// Prisma error code
			if (error.code === 'P2003') {
				// Return 400
				throw new BadRequestException("Invalid user data");
			}

			// This will be caught in impl as 400 code.
			throw error;
		}
	}

	async findByKeycloakId(keycloakId: string) {
		const user = await prisma.user.findUnique({
			where: { keycloakId },
			select: {
				id: true,
				keycloakId: true,
				email: true,
				username: true,
				currency: true,
				userAvatar: true,
				createdAt: true,
			},
		});

		// Return 404
		if (!user) throw new NotFoundException("User not found");

		return user;
	}

	async findAll() {
		return prisma.user.findMany({
			select: {
				id: true,
				keycloakId: true,
				email: true,
				username: true,
				currency: true,
				userAvatar: true,
				createdAt: true,
			},
		});
	}

	async findOne(id: string) {
		const user = await prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				keycloakId: true,
				email: true,
				username: true,
				currency: true,
				userAvatar: true,
				createdAt: true,
			},
		});

		// Return 404
		if (!user) throw new NotFoundException('User not found');

		return user;
	}

	async update(id: string,
		     data: { username?: string; currency?: string; userAvatar?: string },
	) {
		await this.findOne(id); // Return 404 if user does not exists.

		try {
			return await prisma.user.update({
				where: { id },
				data,
			});

		} catch (error: any) {
			// Prisma error code
			if (error.code === 'P2002') {
				// Return 409
				throw new ConflictException('User with this email already exists');
			}

			// Prisma error code
			if (error.code === 'P2025') {
				// Return 404
				throw new NotFoundException('User not found');
			}

			// This will be caught in impl as 400 code.
			throw error;
		}
	}

	async delete(id: string) {
		await this.findOne(id); // Return 404 if user does not exist.

		try {
			return await prisma.user.delete({ where: { id } });
		} catch (error: any) {
			// Prisma error code
			if (error.code === 'P2025') {
				// Return 404
				throw new NotFoundException('User not found');
			}

			throw error;
		}
	}
}

