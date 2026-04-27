import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../prisma';

@Injectable()
export class BudgetsService {
  async create(data: {
    userId: string;
    categoryId?: string;
    amount: number;
    notifyThreshold: number;
    endDate?: Date;
  }) {
    return prisma.budget.create({ data, include: { category: true } });
  }

  async findAll(userId?: string) {
    return prisma.budget.findMany({
      where: userId ? { userId } : undefined,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const budget = await prisma.budget.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!budget) throw new NotFoundException('Budget not found');
    return budget;
  }

  async update(
    id: string,
    data: {
      categoryId?: string;
      amount?: number;
      notifyThreshold?: number;
      endDate?: Date;
    },
  ) {
    await this.findOne(id);
    return prisma.budget.update({ where: { id }, data, include: { category: true } });
  }

  async delete(id: string) {
    await this.findOne(id);
    return prisma.budget.delete({ where: { id } });
  }
}
