import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../prisma';

@Injectable()
export class ExpensesService {
  async create(data: {
    userId: string;
    merchantId?: string;
    totalAmount: number;
    expenseDate: Date;
    isRecurring?: boolean;
    note?: string;
  }) {
    return prisma.expense.create({ data });
  }

  async findAll(userId?: string) {
    return prisma.expense.findMany({
      where: userId ? { userId } : undefined,
      include: {
        merchant: true,
        expenseItems: true,
      },
      orderBy: { expenseDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        merchant: true,
        expenseItems: true,
      },
    });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async update(
    id: string,
    data: {
      merchantId?: string;
      totalAmount?: number;
      expenseDate?: Date;
      isRecurring?: boolean;
      note?: string;
    },
  ) {
    await this.findOne(id);
    return prisma.expense.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findOne(id);
    return prisma.expense.delete({ where: { id } });
  }
}
