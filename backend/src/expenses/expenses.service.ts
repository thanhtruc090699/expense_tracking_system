import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
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
    try {
      return await prisma.expense.create({ data });
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new BadRequestException('Invalid expense data');
      }
      throw error;
    }
  }

  async findAll(userId?: string) {
    try {
      return await prisma.expense.findMany({
        where: userId ? { userId } : undefined,
        include: {
          merchant: true,
          expenseItems: true,
        },
        orderBy: { expenseDate: 'desc' },
      });
    } catch (error: any) {
      throw new BadRequestException('Failed to retrieve expenses');
    }
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

  async findByMerchant(merchantId: string) {
    try {
      return await prisma.expense.findMany({
        where: { merchantId },
        include: {
          merchant: true,
          expenseItems: true,
        },
        orderBy: { expenseDate: 'desc' },
      });
    } catch (error: any) {
      throw new BadRequestException('Failed to retrieve expenses');
    }
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
    try {
      return await prisma.expense.update({ where: { id }, data });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Expense already exists');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Expense not found');
      }
      throw new BadRequestException('Invalid expense data');
    }
  }

  async delete(id: string) {
    await this.findOne(id);
    try {
      return await prisma.expense.delete({ where: { id } });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Expense not found');
      }
      throw error;
    }
  }
}
