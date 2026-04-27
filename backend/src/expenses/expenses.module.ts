import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { ExpensesApiImpl } from './expenses.impl';
import { EXPENSES_API_PROVIDER } from './expenses.constants';

@Module({
  imports: [JwtModule],
  controllers: [ExpensesController],
  providers: [
    ExpensesService,
    {
      provide: EXPENSES_API_PROVIDER,
      useClass: ExpensesApiImpl,
    },
  ],
  exports: [EXPENSES_API_PROVIDER],
})
export class ExpensesModule {}
