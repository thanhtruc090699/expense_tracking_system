import { Injectable } from '@nestjs/common';
import type {
  Budget,
  CreateBudgetDto,
  UpdateBudgetDto,
  PartiallyUpdateBudgetDto,
  DeleteBudget200Response,
} from '../generated/models';
import { BudgetsApi } from '../generated/api/BudgetsApi';
import { BudgetsService } from './budgets.service';
import { BudgetMapper } from './budgets.mapper';

@Injectable()
export class BudgetsApiImpl extends BudgetsApi {
  constructor(private readonly budgetsService: BudgetsService) {
    super();
  }

  async createBudget(
    createBudgetDto: CreateBudgetDto,
    request: Request,
  ): Promise<Budget> {
    const budget = await this.budgetsService.createBudget(
      createBudgetDto,
      request,
    );
    return BudgetMapper.toBudget(budget);
  }

  async findAllBudgets(
    userId: string | undefined,
    request: Request,
  ): Promise<Budget[]> {
    const budgets = await this.budgetsService.findAllBudgets(userId, request);
    return budgets.map((b) => BudgetMapper.toBudget(b));
  }

  async findOneBudget(id: string, request?: Request): Promise<Budget> {
    const budget = await this.budgetsService.findOneBudget(id, request);
    return BudgetMapper.toBudget(budget);
  }

  async updateBudget(
    id: string,
    updateBudgetDto: UpdateBudgetDto,
    request?: Request,
  ): Promise<Budget> {
    const budget = await this.budgetsService.updateBudget(
      id,
      updateBudgetDto,
      request,
    );
    return BudgetMapper.toBudget(budget);
  }

  async partiallyUpdateBudget(
    id: string,
    partiallyUpdateBudgetDto: PartiallyUpdateBudgetDto,
    request?: Request,
  ): Promise<Budget> {
    const budget = await this.budgetsService.partiallyUpdateBudget(
      id,
      partiallyUpdateBudgetDto,
      request,
    );
    return BudgetMapper.toBudget(budget);
  }

  async deleteBudget(
    id: string,
    request?: Request,
  ): Promise<DeleteBudget200Response> {
    await this.budgetsService.deleteBudget(id, request);
    return { message: 'Budget deleted successfully' };
  }
}
