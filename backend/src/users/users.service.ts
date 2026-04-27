import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../prisma';

@Injectable()
export class UsersService {
  async create(data: { keycloakId: string; email: string; username?: string; currency?: string; userAvatar?: string }) {
    return prisma.user.create({ data });
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

  async update(id: string, data: { username?: string; currency?: string; userAvatar?: string }) {
    await this.findOne(id);
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    return prisma.user.delete({ where: { id } });
  }
}
