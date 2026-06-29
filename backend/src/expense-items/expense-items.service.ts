import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { prisma } from '../prisma';
import { CacheService } from '../cache/cache.service';
import { TTL_CONFIG } from '../cache/cache.strategy';

@Injectable()
export class ExpenseItemsService {
  constructor(private readonly cacheService: CacheService) {}

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
    categoryId?: string | null;
  }) {
    if (data.quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    if (data.unitPrice <= 0) {
      throw new BadRequestException('Unit price must be greater than 0');
    }

    await this.validateExpenseExists(data.expenseId);

    if (data.categoryId) {
      await this.validateCategoryExists(data.categoryId);
    }

    const totalPrice = data.quantity * data.unitPrice;

    try {
      const result = await prisma.expenseItem.create({
        data: {
          expenseId: data.expenseId,
          itemName: data.itemName,
          quantity: data.quantity,
          unitPrice: data.unitPrice,
          totalPrice,
          ...(data.categoryId ? { categoryId: data.categoryId } : {}),
        } as any,
        include: {
          category: true,
        },
      });

      const expense = await prisma.expense.findUnique({
        where: { id: data.expenseId },
      });

      if (expense) {
        const monthKey = `${new Date(expense.expenseDate).getFullYear()}-${String(new Date(expense.expenseDate).getMonth() + 1).padStart(2, '0')}`;
        await this.cacheService.invalidateByTag(`tag:user:${expense.userId}:expenses`);
        await this.cacheService.invalidateByTag(`tag:user:${expense.userId}:month:${monthKey}`);
      }

      await this.cacheService.delete(`expense:${data.expenseId}:items`);
      
      return result;
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
      const cacheKey = `expense:${expenseId}:items`;
      const cached = await this.cacheService.get<any[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const result = await prisma.expenseItem.findMany({
      where: expenseId ? { expenseId } : undefined,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    if (expenseId) {
      await this.cacheService.set(
        `expense:${expenseId}:items`,
        result,
        TTL_CONFIG.EXPENSE_ITEMS,
        [`tag:expense:${expenseId}:items`],
      );
    }

    return result;
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
      categoryId?: string | null;
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
      const result = await prisma.expenseItem.update({
        where: { id },
        data: {
          ...data,
          totalPrice,
        },
        include: { category: true },
      });

      const expense = await prisma.expense.findUnique({
        where: { id: existingItem.expenseId },
      });

      if (expense) {
        const monthKey = `${new Date(expense.expenseDate).getFullYear()}-${String(new Date(expense.expenseDate).getMonth() + 1).padStart(2, '0')}`;
        await this.cacheService.invalidateByTag(`tag:user:${expense.userId}:expenses`);
        await this.cacheService.invalidateByTag(`tag:user:${expense.userId}:month:${monthKey}`);
      }

      await this.cacheService.delete(`expense:${existingItem.expenseId}:items`);
      
      return result;
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
    const expenseItem = await this.findOne(id);

    try {
      const expenseId = expenseItem.expenseId;
      await prisma.expenseItem.delete({
        where: { id },
      });

      const expense = await prisma.expense.findUnique({
        where: { id: expenseId },
      });

      if (expense) {
        const monthKey = `${new Date(expense.expenseDate).getFullYear()}-${String(new Date(expense.expenseDate).getMonth() + 1).padStart(2, '0')}`;
        await this.cacheService.invalidateByTag(`tag:user:${expense.userId}:expenses`);
        await this.cacheService.invalidateByTag(`tag:user:${expense.userId}:month:${monthKey}`);
      }

      await this.cacheService.delete(`expense:${expenseId}:items`);
      
      return;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Expense item not found');
      }

      throw error;
    }
  }
}
