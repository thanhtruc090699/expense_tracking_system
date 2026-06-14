import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ExpensesModule } from '../expenses/expenses.module';
import { BudgetsModule } from '../budgets/budgets.module';
import { MerchantsModule } from '../merchants/merchants.module';
import { ExpenseItemsModule } from '../expense-items/expense-items.module';
import { LisaController } from './lisa.controller';
import { LisaService } from './lisa.service';
import { LisaApiImpl } from './lisa.impl';
import { LISA_API_PROVIDER } from './lisa.constants';

@Module({
  imports: [
    AuthModule,
    ExpensesModule,
    BudgetsModule,
    MerchantsModule,
    ExpenseItemsModule,
  ],
  controllers: [LisaController],
  providers: [
    LisaService,
    {
      provide: LISA_API_PROVIDER,
      useClass: LisaApiImpl,
    },
  ],
  exports: [LisaService],
})
export class LisaModule {}
