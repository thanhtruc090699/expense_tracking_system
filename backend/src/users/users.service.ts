import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../prisma';

@Injectable()
export class UsersService {
  async create(data: { email: string; password: string; username?: string }) {
    return prisma.user.create({ data });
  }

  async findAll() {
    return prisma.user.findMany({
      select: { id: true, email: true, username: true, avatar: true, createdAt: true, updatedAt: true },
    });
  }

  async findOne(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, username: true, avatar: true, createdAt: true, updatedAt: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async delete(id: string) {
    await this.findOne(id);
    return prisma.user.delete({ where: { id } });
  }
}