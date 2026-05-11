import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { ExpenseItemsController } from './expense-items.controller';
import { ExpenseItemsService } from './expense-items.service';
import { ExpenseItemsApiImpl } from './expense-items.impl';
import { EXPENSE_ITEMS_API_PROVIDER } from './expense-items.constants';

@Module({
  imports: [JwtModule],
  controllers: [ExpenseItemsController],
  providers: [
    ExpenseItemsService,
    {
      provide: EXPENSE_ITEMS_API_PROVIDER,
      useClass: ExpenseItemsApiImpl,
    },
  ],
  exports: [EXPENSE_ITEMS_API_PROVIDER],
})
export class ExpenseItemsModule {}
