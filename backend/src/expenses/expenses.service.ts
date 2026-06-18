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

  async findAll(filters: {
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    categoryId?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      const where: any = {};

      if (filters.userId) {
        where.userId = filters.userId;
      }

      if (filters.startDate || filters.endDate) {
        where.expenseDate = {};
        if (filters.startDate) {
          where.expenseDate.gte = filters.startDate;
        }
        if (filters.endDate) {
          where.expenseDate.lte = filters.endDate;
        }
      }

      if (filters.categoryId) {
        where.expenseItems = {
          some: {
            categoryId: filters.categoryId,
          },
        };
      }

      const limit = filters.limit ?? 20;
      const offset = filters.offset ?? 0;

      return await prisma.expense.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        include: {
          merchant: true,
          expenseItems: true,
        },
        orderBy: { expenseDate: 'desc' },
        take: limit,
        skip: offset,
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

  async getSummary(userId: string, month: Date) {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        expenseDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        merchant: true,
        expenseItems: true,
      },
      orderBy: { expenseDate: 'desc' },
    });

    const totalAmount = expenses.reduce(
      (sum, expense) => sum + Number(expense.totalAmount),
      0,
    );
    const transactionCount = expenses.length;
    const averageTransactionAmount =
      transactionCount > 0 ? totalAmount / transactionCount : 0;
    const topTransactions = expenses.slice(0, 5);

    return {
      month: startOfMonth.toISOString(),
      totalAmount,
      transactionCount,
      averageTransactionAmount,
      topTransactions,
    };
  }

  async getSpendingSummary(userId: string, month: Date) {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    const categories = await prisma.category.findMany();
    const categoryMap = new Map(
      categories.map((c) => [c.id, { id: c.id, name: c.name }]),
    );

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        expenseDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        expenseItems: {
          include: {
            category: true,
          },
        },
      },
    });

    const categoryTotals = new Map<string, number>();
    let totalAmount = 0;

    for (const expense of expenses) {
      for (const item of expense.expenseItems) {
        const itemTotal = Number(item.totalPrice);
        totalAmount += itemTotal;

        if (item.categoryId) {
          const current = categoryTotals.get(item.categoryId) || 0;
          categoryTotals.set(item.categoryId, current + itemTotal);
        } else {
          const current = categoryTotals.get('others') || 0;
          categoryTotals.set('others', current + itemTotal);
        }
      }
    }

    const categoryBreakdown: Array<{
      categoryId: string;
      categoryName: string;
      amount: number;
      percentage: number;
    }> = [];
    const othersTotal = categoryTotals.get('others') || 0;

    for (const [categoryId, amount] of categoryTotals.entries()) {
      if (categoryId === 'others') {
        categoryBreakdown.push({
          categoryId: 'others',
          categoryName: 'Others',
          amount: Number(amount.toFixed(2)),
          percentage:
            totalAmount > 0
              ? Number(((amount / totalAmount) * 100).toFixed(2))
              : 0,
        });
      } else {
        const category = categoryMap.get(categoryId);
        if (category) {
          categoryBreakdown.push({
            categoryId: category.id,
            categoryName: category.name,
            amount: Number(amount.toFixed(2)),
            percentage:
              totalAmount > 0
                ? Number(((amount / totalAmount) * 100).toFixed(2))
                : 0,
          });
        }
      }
    }

    categoryBreakdown.sort((a, b) => b.amount - a.amount);

    return {
      month: startOfMonth.toISOString(),
      totalAmount: Number(totalAmount.toFixed(2)),
      categoryBreakdown,
    };
  }
}
