import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { prisma } from '../prisma';

@Injectable()
export class MerchantsService {
  async create(data: { name: string; business?: string }) {
    try {
      return await prisma.merchant.create({ data });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Merchant with this name already exists');
      }
      throw error;
    }
  }

  async findAll() {
    try {
      return await prisma.merchant.findMany({ orderBy: { name: 'asc' } });
    } catch (error: any) {
      throw new BadRequestException('Failed to retrieve merchants');
    }
  }

  async search(name: string) {
    return prisma.merchant.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const merchant = await prisma.merchant.findUnique({ where: { id } });
    if (!merchant) throw new NotFoundException('Merchant not found');
    return merchant;
  }

  async update(id: string, data: { name?: string; business?: string }) {
    await this.findOne(id);
    return prisma.merchant.update({ where: { id }, data });
  }
}
