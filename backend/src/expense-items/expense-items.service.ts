import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../prisma';

@Injectable()
export class ExpenseItemsService {
  async create(data: {
    expenseId: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    categoryId: string;
  }) {
    return prisma.expenseItem.create({ data, include: { category: true } });
  }

  async findAll(expenseId?: string) {
    return prisma.expenseItem.findMany({
      where: expenseId ? { expenseId } : undefined,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const expenseItem = await prisma.expenseItem.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!expenseItem) throw new NotFoundException('Expense item not found');
    return expenseItem;
  }

  async update(
    id: string,
    data: {
      itemName?: string;
      quantity?: number;
      unitPrice?: number;
      totalPrice?: number;
      categoryId?: string;
    },
  ) {
    await this.findOne(id);
    return prisma.expenseItem.update({ where: { id }, data, include: { category: true } });
  }

  async delete(id: string) {
    await this.findOne(id);
    return prisma.expenseItem.delete({ where: { id } });
  }
}
