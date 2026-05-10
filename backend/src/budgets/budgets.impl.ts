import { Injectable } from '@nestjs/common';
import type { Budget, CreateBudgetDto, UpdateBudgetDto, DeleteBudget200Response } from '../generated/models';
import { BudgetsApi } from '../generated/api/BudgetsApi';
import { BudgetsService } from './budgets.service';

@Injectable()
export class BudgetsApiImpl extends BudgetsApi {
  constructor(private readonly budgetsService: BudgetsService) {
    super();
  }

  async createBudget(createBudgetDto: CreateBudgetDto, request: Request): Promise<Budget> {
    const user = request['user'] as { id: string };
    const data = {
      ...createBudgetDto,
      userId: user.id,
      endDate: createBudgetDto.endDate ? new Date(createBudgetDto.endDate) : undefined,
    };
    const budget = await this.budgetsService.create(data);
    return this.toBudget(budget);
  }

  async findAllBudgets(userId: string | undefined, request: Request): Promise<Budget[]> {
    const user = request['user'] as { id: string };
    const budgets = await this.budgetsService.findAll(user.id);
    return budgets.map((b) => this.toBudget(b));
  }

  async findOneBudget(id: string): Promise<Budget> {
    const budget = await this.budgetsService.findOne(id);
    return this.toBudget(budget);
  }

  async updateBudget(id: string, updateBudgetDto: UpdateBudgetDto): Promise<Budget> {
    const data = {
      ...updateBudgetDto,
      endDate: updateBudgetDto.endDate ? new Date(updateBudgetDto.endDate) : undefined,
    };
    const budget = await this.budgetsService.update(id, data);
    return this.toBudget(budget);
  }

  async partiallyUpdateBudget(id: string, updateBudgetDto: UpdateBudgetDto): Promise<Budget> {
    const data = {...updateBudgetDto,
      endDate: updateBudgetDto.endDate ? new Date(updateBudgetDto.endDate) : undefined,
    };
    const budget = await this.budgetsService.update(id, data);
    return this.toBudget(budget);
  }
  async deleteBudget(id: string): Promise<DeleteBudget200Response> {
    await this.budgetsService.delete(id);
    return { message: 'Budget deleted successfully' };
  }

  private toBudget(budget: any): Budget {
    return {
      ...budget,
      amount: Number(budget.amount),
      notifyThreshold: Number(budget.notifyThreshold),
      endDate: budget.endDate?.toISOString() || null,
      createdAt: budget.createdAt.toISOString(),
    };
  }
}
