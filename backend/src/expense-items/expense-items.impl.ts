import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import type {
  ExpenseItem,
  CreateExpenseItemDto,
  UpdateExpenseItemDto,
  DeleteExpenseItem200Response,
} from '../generated/models';
import { ExpenseItemsApi } from '../generated/api/ExpenseItemsApi';
import { ExpenseItemsService } from './expense-items.service';

@Injectable()
export class ExpenseItemsApiImpl extends ExpenseItemsApi {
  constructor(private readonly expenseItemsService: ExpenseItemsService) {
    super();
  }

  async createExpenseItem(
    createExpenseItemDto: CreateExpenseItemDto,
    request: Request,
  ): Promise<ExpenseItem> {
    if (
      !createExpenseItemDto.expenseId ||
      !createExpenseItemDto.itemName ||
      !createExpenseItemDto.quantity ||
      !createExpenseItemDto.unitPrice ||
      !createExpenseItemDto.totalPrice ||
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
    expenseId: string | undefined,
    request: Request,
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

  async findOneExpenseItem(id: string): Promise<ExpenseItem> {
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

  async deleteExpenseItem(id: string): Promise<DeleteExpenseItem200Response> {
    try {
      await this.expenseItemsService.delete(id);
      return { message: 'Expense item deleted successfully' };
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
      ...item,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
      createdAt: item.createdAt.toISOString(),
    };
  }
}
