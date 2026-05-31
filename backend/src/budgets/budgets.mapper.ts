// budgets.mapper.ts
import type {
  Budget,
  CreateBudgetDto,
  UpdateBudgetDto,
  DeleteBudget200Response,
} from '../generated/models';
export const BudgetMapper = {
  toBudget(createdBudget: any) {
     return{
      id: createdBudget.id,
      userId: createdBudget.userId,
      categoryId: createdBudget.categoryId ?? null,
      amount: Number(createdBudget.amount),
      notifyThreshold: Number(createdBudget.notifyThreshold),
      endDate: normalizeDate(createdBudget.endDate),
      createdAt: normalizeDate(createdBudget.createdAt),
      category: createdBudget.category ?? undefined,
    };
  },
};

function normalizeDate(value: Date | string): string {
  const data = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(data.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }

  return data.toISOString();
}