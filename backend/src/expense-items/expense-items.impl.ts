import { Injectable } from '@nestjs/common';
import { ExpenseItemsService } from './expense-items.service';

import type {
  ExpenseItem,
  CreateExpenseItemDto,
  UpdateExpenseItemDto,
  DeleteExpenseItem200Response,
} from '../generated/models';

@Injectable()
export class ExpenseItemsApiImpl {
  constructor(
    private readonly expenseItemsService: ExpenseItemsService,
  ) {}

  async createExpenseItem(
    createExpenseItemDto: CreateExpenseItemDto,
    request?: Request,
  ): Promise<ExpenseItem> {
    const item = await this.expenseItemsService.create(
      createExpenseItemDto,
    );

    return this.toExpenseItem(item);
  }

  async findAllExpenseItems(
    expenseId?: string,
    request?: Request,
  ): Promise<ExpenseItem[]> {
    const items = await this.expenseItemsService.findAll(
      expenseId,
    );

    return items.map((i) => this.toExpenseItem(i));
  }

  async findOneExpenseItem(
    id: string,
    request?: Request,
  ): Promise<ExpenseItem> {
    const item = await this.expenseItemsService.findOne(id);

    return this.toExpenseItem(item);
  }

  async updateExpenseItem(
    id: string,
    updateExpenseItemDto: UpdateExpenseItemDto,
    request?: Request,
  ): Promise<ExpenseItem> {
    const item = await this.expenseItemsService.update(
      id,
      updateExpenseItemDto,
    );

    return this.toExpenseItem(item);
  }

  async deleteExpenseItem(
    id: string,
    request?: Request,
  ): Promise<DeleteExpenseItem200Response> {
    await this.expenseItemsService.delete(id);

    return {
      message: 'Expense item deleted successfully',
    };
  }

  private toExpenseItem(item: any): ExpenseItem {
    return {
      id: item.id,
      expenseId: item.expenseId,
      itemName: item.itemName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      categoryId: item.categoryId,
      createdAt: item.createdAt,
      category: item.category,
    };
  }
}