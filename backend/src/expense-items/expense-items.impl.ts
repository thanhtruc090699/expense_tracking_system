import { Injectable } from '@nestjs/common';
import type { ExpenseItem, CreateExpenseItemDto, UpdateExpenseItemDto, DeleteExpenseItem200Response } from '../generated/models';
import { ExpenseItemsApi } from '../generated/api/ExpenseItemsApi';
import { ExpenseItemsService } from './expense-items.service';

@Injectable()
export class ExpenseItemsApiImpl extends ExpenseItemsApi {
  constructor(private readonly expenseItemsService: ExpenseItemsService) {
    super();
  }

  async createExpenseItem(createExpenseItemDto: CreateExpenseItemDto, request: Request): Promise<ExpenseItem> {
    const item = await this.expenseItemsService.create(createExpenseItemDto);
    return this.toExpenseItem(item);
  }

  async findAllExpenseItems(expenseId: string | undefined, request: Request): Promise<ExpenseItem[]> {
    const items = await this.expenseItemsService.findAll(expenseId);
    return items.map((i) => this.toExpenseItem(i));
  }

  async findOneExpenseItem(id: string): Promise<ExpenseItem> {
    const item = await this.expenseItemsService.findOne(id);
    return this.toExpenseItem(item);
  }

  async updateExpenseItem(id: string, updateExpenseItemDto: UpdateExpenseItemDto): Promise<ExpenseItem> {
    const item = await this.expenseItemsService.update(id, updateExpenseItemDto);
    return this.toExpenseItem(item);
  }

  async deleteExpenseItem(id: string): Promise<DeleteExpenseItem200Response> {
    await this.expenseItemsService.delete(id);
    return { message: 'Expense item deleted successfully' };
  }

  private toExpenseItem(item: any): ExpenseItem {
    return {
      ...item,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
      createdAt: item.createdAt.toISOString(),
    };
  }
}
