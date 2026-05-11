import { Injectable } from '@nestjs/common';
import type {
  Expense,
  CreateExpenseDto,
  UpdateExpenseDto,
  DeleteExpense200Response,
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
    const user = request['user'] as { id: string };
    const data = {
      ...createExpenseDto,
      userId: user.id,
      expenseDate: new Date(createExpenseDto.expenseDate),
    };
    const expense = await this.expensesService.create(data);
    return this.toExpense(expense);
  }

  async findAllExpenses(
    userId: string | undefined,
    request: Request,
  ): Promise<Expense[]> {
    const user = request['user'] as { id: string };
    const expenses = await this.expensesService.findAll(user.id);
    return expenses.map((e) => this.toExpense(e));
  }

  async findOneExpense(id: string): Promise<Expense> {
    const expense = await this.expensesService.findOne(id);
    return this.toExpense(expense);
  }

  async updateExpense(
    id: string,
    updateExpenseDto: UpdateExpenseDto,
  ): Promise<Expense> {
    const data = {
      ...updateExpenseDto,
      expenseDate: updateExpenseDto.expenseDate
        ? new Date(updateExpenseDto.expenseDate)
        : undefined,
    };
    const expense = await this.expensesService.update(id, data);
    return this.toExpense(expense);
  }

  async deleteExpense(id: string): Promise<DeleteExpense200Response> {
    await this.expensesService.delete(id);
    return { message: 'Expense deleted successfully' };
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
