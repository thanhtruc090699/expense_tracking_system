import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ExpenseItemsService } from './expense-items.service';
import type {
  ExpenseItem,
  CreateExpenseItemDto,
  UpdateExpenseItemDto,
  DeleteExpenseItem200Response,
} from '../generated/models';

@Injectable()
export class ExpenseItemsApiImpl {
  constructor(private readonly expenseItemsService: ExpenseItemsService) {}

  async createExpenseItem(
    createExpenseItemDto: CreateExpenseItemDto,
    request?: Request,
  ): Promise<ExpenseItem> {
    if (
      !createExpenseItemDto.expenseId ||
      !createExpenseItemDto.itemName ||
      !createExpenseItemDto.quantity ||
      !createExpenseItemDto.unitPrice ||
      !createExpenseItemDto.categoryId
    ) {
      throw new BadRequestException('Missing required fields');
    }

    try {
      await this.expenseItemsService.validateExpenseExists(
        createExpenseItemDto.expenseId,
      );
      await this.expenseItemsService.validateCategoryExists(
        createExpenseItemDto.categoryId,
      );

      const item = await this.expenseItemsService.create(createExpenseItemDto);
      return this.toExpenseItem(item);
    } catch (error: any) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new BadRequestException('Invalid expense item data');
    }
  }

  async findAllExpenseItems(
    expenseId?: string,
    request?: Request,
  ): Promise<ExpenseItem[]> {
    try {
      const items = await this.expenseItemsService.findAll(expenseId);
      return items.map((i) => this.toExpenseItem(i));
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException('Failed to retrieve expense items');
    }
  }

  async findOneExpenseItem(
    id: string,
    request?: Request,
  ): Promise<ExpenseItem> {
    try {
      const item = await this.expenseItemsService.findOne(id);
      return this.toExpenseItem(item);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new BadRequestException('Invalid expense item ID');
    }
  }

  async updateExpenseItem(
    id: string,
    updateExpenseItemDto: UpdateExpenseItemDto,
    request?: Request,
  ): Promise<ExpenseItem> {
    try {
      if (updateExpenseItemDto.categoryId) {
        await this.expenseItemsService.validateCategoryExists(
          updateExpenseItemDto.categoryId,
        );
      }

      const item = await this.expenseItemsService.update(
        id,
        updateExpenseItemDto,
      );

      return this.toExpenseItem(item);
    } catch (error: any) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new BadRequestException('Invalid expense item data');
    }
  }

  async deleteExpenseItem(
    id: string,
    request?: Request,
  ): Promise<DeleteExpenseItem200Response> {
    try {
      await this.expenseItemsService.delete(id);

      return {
        message: 'Expense item deleted successfully',
      };
    } catch (error: any) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new BadRequestException('Failed to delete expense item');
    }
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