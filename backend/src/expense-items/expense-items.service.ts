import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../prisma';
import { BadRequestException,} from '@nestjs/common';

@Injectable()
export class ExpenseItemsService {
  async create(data: {
    expenseId: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    categoryId: string;
  }) {
    if (data.quantity <= 0) {
  throw new BadRequestException('Quantity must be greater than 0');
}

if (data.unitPrice <= 0) {
  throw new BadRequestException('Unit price must be greater than 0');
} 
    const expenseExists = await prisma.expense.findUnique({
  where: { id: data.expenseId },
});

if (!expenseExists) {
  throw new NotFoundException('Expense not found');
}

const categoryExists = await prisma.category.findUnique({
  where: { id: data.categoryId },
});

if (!categoryExists) {
  throw new NotFoundException('Category not found');
}
   const totalPrice = data.quantity * data.unitPrice;

return prisma.expenseItem.create({
  data: {
    ...data,
    totalPrice,
  },
  include: {
    category: true,
  },
});
  }

  async findAll(expenseId?: string) {
    if (expenseId) {
  const expenseExists = await prisma.expense.findUnique({
    where: { id: expenseId },
  });

  if (!expenseExists) {
    throw new NotFoundException('Expense not found');
  }
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
  const existingItem = await this.findOne(id);
  if (data.quantity !== undefined && data.quantity <= 0) {
  throw new BadRequestException('Quantity must be greater than 0');
}

if (data.unitPrice !== undefined && data.unitPrice <= 0) {
  throw new BadRequestException('Unit price must be greater than 0');
}
  if (data.categoryId) {
  const categoryExists = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });

  if (!categoryExists) {
    throw new NotFoundException('Category not found');
  }
}

 const totalPrice =
  Number(data.quantity ?? existingItem.quantity) *
  Number(data.unitPrice ?? existingItem.unitPrice);

  return prisma.expenseItem.update({
    where: { id },
    data: {
      ...data,
      totalPrice,
    },
    include: { category: true },
  });
}

  async delete(id: string) {
    const existingItem = await this.findOne(id);
    return prisma.expenseItem.delete({ where: { id } });
  }
}
