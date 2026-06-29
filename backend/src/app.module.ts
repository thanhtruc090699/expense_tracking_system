import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from './cache/cache.module';
import { OcrModule } from './ocr/ocr.module';
import { UsersModule } from './users/users.module';
import { LisaModule } from './lisa/lisa.module';
import { AuthModule } from './auth/auth.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ExpenseItemsModule } from './expense-items/expense-items.module';
import { MerchantsModule } from './merchants/merchants.module';
import { CategoriesModule } from './categories/categories.module';
import { BudgetsModule } from './budgets/budgets.module';

@Module({
  imports: [
    CacheModule,
    OcrModule,
    UsersModule,
    LisaModule,
    ConfigModule.forRoot(),
    AuthModule,
    ExpensesModule,
    ExpenseItemsModule,
    MerchantsModule,
    CategoriesModule,
    BudgetsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
