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
      if (error.code === 'P2002') { // Prisma code
        throw new ConflictException('User with this email or keycloak ID already exists');
      }
      if (error.code === 'P2003') { // Prisma code
        throw new BadRequestException('Invalid user data');
      }
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
    if (!user) throw new NotFoundException('User not found');
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
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(
    id: string,
    data: { username?: string; currency?: string; userAvatar?: string },
  ) {
    await this.findOne(id);
    try {
      return await prisma.user.update({
        where: { id },
        data,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('User with this email already exists');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }

  async delete(id: string) {
    await this.findOne(id);
    try {
      return await prisma.user.delete({ where: { id } });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }
}
