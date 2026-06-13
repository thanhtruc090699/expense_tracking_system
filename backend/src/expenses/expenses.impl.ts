import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import type {
  Expense,
  CreateExpenseDto,
  UpdateExpenseDto,
  DeleteExpense200Response,
  ExpenseSummary,
  SpendingSummary,
} from '../generated/models';
import { ExpensesApi } from '../generated/api/ExpensesApi';
import { ExpensesService } from './expenses.service';

@Injectable()
export class ExpensesApiImpl extends ExpensesApi {
  constructor(private readonly expensesService: ExpensesService) {
    super();
  }

  async createExpense(
    createExpenseDto: CreateExpenseDto,
    request: Request,
  ): Promise<Expense> {
    if (!createExpenseDto.totalAmount || !createExpenseDto.expenseDate) {
      throw new BadRequestException(
        'Total amount and expense date are required',
      );
    }

    try {
      const user = request['user'] as { id: string };
      const data = {
        ...createExpenseDto,
        userId: user.id,
        expenseDate: new Date(createExpenseDto.expenseDate),
      };
      const expense = await this.expensesService.create(data);
      return this.toExpense(expense);
    } catch (error: any) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException('Invalid expense data');
    }
  }

  async findAllExpenses(
    userId: string | undefined,
    startDate: string | undefined,
    endDate: string | undefined,
    limit: number | undefined,
    offset: number | undefined,
    request: Request,
  ): Promise<Expense[]> {
    const user = request['user'] as { id: string };
    const effectiveUserId = userId || user.id;

    const expenses = await this.expensesService.findAll({
      userId: effectiveUserId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit,
      offset,
    });

    return expenses.map((e) => this.toExpense(e));
  }

  async findOneExpense(id: string): Promise<Expense> {
    const expense = await this.expensesService.findOne(id);
    return this.toExpense(expense);
  }

  async findExpensesByMerchant(merchantId: string): Promise<Expense[]> {
    const expenses = await this.expensesService.findByMerchant(merchantId);
    return expenses.map((e) => this.toExpense(e));
  }

  async updateExpense(
    id: string,
    updateExpenseDto: UpdateExpenseDto,
  ): Promise<Expense> {
    try {
      const data = {
        ...updateExpenseDto,
        expenseDate: updateExpenseDto.expenseDate
          ? new Date(updateExpenseDto.expenseDate)
          : undefined,
      };
      const expense = await this.expensesService.update(id, data);
      return this.toExpense(expense);
    } catch (error: any) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException('Invalid expense data');
    }
  }

  async deleteExpense(id: string): Promise<DeleteExpense200Response> {
    try {
      await this.expensesService.delete(id);
      return { message: 'Expense deleted successfully' };
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw error;
    }
  }

  async fetchSummary(month: string, request: Request): Promise<ExpenseSummary> {
    const monthDate = new Date(month);
    if (isNaN(monthDate.getTime())) {
      throw new BadRequestException('Invalid month format');
    }

    const user = request['user'] as { id: string };
    const summary = await this.expensesService.getSummary(user.id, monthDate);

    return {
      ...summary,
      totalAmount: Number(summary.totalAmount),
      averageTransactionAmount: Number(summary.averageTransactionAmount),
      topTransactions: summary.topTransactions.map((e) => this.toExpense(e)),
    };
  }

  async fetchSpendingSummary(
    month: string,
    request: Request,
  ): Promise<SpendingSummary> {
    const monthDate = new Date(month);
    if (isNaN(monthDate.getTime())) {
      throw new BadRequestException('Invalid month format');
    }

    const user = request['user'] as { id: string };
    const summary = await this.expensesService.getSpendingSummary(
      user.id,
      monthDate,
    );

    return {
      month: summary.month,
      totalAmount: summary.totalAmount,
      categoryBreakdown: summary.categoryBreakdown,
    };
  }

  private toExpense(expense: any): Expense {
    return {
      ...expense,
      totalAmount: Number(expense.totalAmount),
      expenseDate: expense.expenseDate.toISOString(),
      createdAt: expense.createdAt.toISOString(),
    };
  }
}
