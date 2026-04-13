import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../prisma';

@Injectable()
export class BillsService {
  async create(data: {
    fileUrl: string;
    fileType: string;
    ocrData?: object;
    userId: string;
  }) {
    return prisma.bill.create({ data });
  }

  async findAll(userId?: string) {
    return prisma.bill.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const bill = await prisma.bill.findUnique({ where: { id } });
    if (!bill) throw new NotFoundException('Bill not found');
    return bill;
  }

  async update(
    id: string,
    data: {
      fileUrl?: string;
      fileType?: string;
      ocrData?: object;
      isDuplicate?: boolean;
    },
  ) {
    await this.findOne(id);
    return prisma.bill.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findOne(id);
    return prisma.bill.delete({ where: { id } });
  }
}
