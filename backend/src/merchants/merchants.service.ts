import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../prisma';

@Injectable()
export class MerchantsService {
  async create(data: { name: string; business?: string }) {
    return prisma.merchant.create({ data });
  }

  async findAll() {
    return prisma.merchant.findMany({ orderBy: { name: 'asc' } });
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
