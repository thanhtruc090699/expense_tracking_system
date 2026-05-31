import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { prisma } from '../prisma';

@Injectable()
export class ExpenseItemsService {
  async validateExpenseExists(expenseId: string) {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      throw new BadRequestException('Expense not found');
    }

    return expense;
  }

  async validateCategoryExists(categoryId: string) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    return category;
  }

  async create(data: {
    expenseId: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice?: number;
    categoryId: string;
  }) {
    if (data.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    if (data.unitPrice <= 0) {
      throw new BadRequestException('Unit price must be greater than 0');
    }

    await this.validateExpenseExists(data.expenseId);
    await this.validateCategoryExists(data.categoryId);

    const totalPrice = data.quantity * data.unitPrice;

    try {
      return await prisma.expenseItem.create({
        data: {
          ...data,
          totalPrice,
        },
        include: {
          category: true,
        },
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
    if (expenseId) {
      await this.validateExpenseExists(expenseId);
    }

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

    if (!expenseItem) {
      throw new NotFoundException('Expense item not found');
    }

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
    const existingItem = await this.findOne(id);

    if (data.quantity !== undefined && data.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    if (data.unitPrice !== undefined && data.unitPrice <= 0) {
      throw new BadRequestException('Unit price must be greater than 0');
    }

    if (data.categoryId) {
      await this.validateCategoryExists(data.categoryId);
    }

    const totalPrice =
      Number(data.quantity ?? existingItem.quantity) *
      Number(data.unitPrice ?? existingItem.unitPrice);

    try {
      return await prisma.expenseItem.update({
        where: { id },
        data: {
          ...data,
          totalPrice,
        },
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
      return await prisma.expenseItem.delete({
        where: { id },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Expense item not found');
      }

      throw error;
    }
  }
}