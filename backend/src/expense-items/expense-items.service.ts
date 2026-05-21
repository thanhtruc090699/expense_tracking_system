import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { prisma } from '../prisma';

@Injectable()
export class ExpenseItemsService {
  async create(data: {
    expenseId: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    categoryId: string | null;
  }) {
    try {
      return await prisma.expenseItem.create({
        data,
        include: { category: true },
      });
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new BadRequestException('Invalid expense or category ID');
      }
      if (error.code === 'P2002') {
        throw new ConflictException('Expense item already exists');
      }
      throw error;
    }
  }

  async findAll(expenseId?: string) {
    try {
      return await prisma.expenseItem.findMany({
        where: expenseId ? { expenseId } : undefined,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error: any) {
      throw new BadRequestException('Failed to retrieve expense items');
    }
  }

  async findOne(id: string) {
    const expenseItem = await prisma.expenseItem.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!expenseItem) throw new NotFoundException('Expense item not found');
    return expenseItem;
  }

  async validateExpenseExists(expenseId: string) {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });
    if (!expense) throw new BadRequestException('Expense not found');
    return expense;
  }

  async validateCategoryExists(categoryId: string) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) throw new BadRequestException('Category not found');
    return category;
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
    try {
      return await prisma.expenseItem.update({
        where: { id },
        data,
        include: { category: true },
      });
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new BadRequestException('Invalid expense or category ID');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Expense item not found');
      }
      throw new BadRequestException('Invalid expense item data');
    }
  }

  async delete(id: string) {
    await this.findOne(id);
    try {
      return await prisma.expenseItem.delete({ where: { id } });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Expense item not found');
      }
      throw error;
    }
  }
}
