// Temporary debug file
import { BudgetsService } from './budgets.service';

export async function testBudgets() {
  const service = new BudgetsService();
  const userId = '3193bac4-82c8-4d75-a649-089d49a4a582';
  const budgets = await service.findAll(userId);
  console.log('Budgets found:', budgets.length);
  console.log(JSON.stringify(budgets, null, 2));
}
