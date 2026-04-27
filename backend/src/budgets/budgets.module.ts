import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';
import { BudgetsApiImpl } from './budgets.impl';
import { BUDGETS_API_PROVIDER } from './budgets.constants';

@Module({
  imports: [JwtModule],
  controllers: [BudgetsController],
  providers: [
    BudgetsService,
    {
      provide: BUDGETS_API_PROVIDER,
      useClass: BudgetsApiImpl,
    },
  ],
  exports: [BUDGETS_API_PROVIDER],
})
export class BudgetsModule {}
