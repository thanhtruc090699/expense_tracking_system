import { Inject, Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import type { Observable } from 'rxjs';
import type { Expense, CreateExpenseDto, DeleteExpense200Response, UpdateExpenseDto } from '../generated/models';
import { ExpensesApi } from '../generated/api/ExpensesApi';
import { EXPENSES_API_PROVIDER } from './expenses.constants';
import { JwtGuard } from '../auth/jwt/jwt.guard';

@Controller('expenses')
@UseGuards(JwtGuard)
export class ExpensesController {
  constructor(@Inject(EXPENSES_API_PROVIDER) private readonly expensesApi: ExpensesApi) {}

  @Post()
  createExpense(@Body() createExpenseDto: CreateExpenseDto, @Req() request: Request): ReturnType<ExpensesApi['createExpense']> {
    return this.expensesApi.createExpense(createExpenseDto, request);
  }

  @Get()
  findAllExpenses(@Query('userId') userId: string | undefined, @Req() request: Request): ReturnType<ExpensesApi['findAllExpenses']> {
    return this.expensesApi.findAllExpenses(userId, request);
  }

  @Get(':id')
  findOneExpense(@Param('id') id: string, @Req() request: Request): ReturnType<ExpensesApi['findOneExpense']> {
    return this.expensesApi.findOneExpense(id, request);
  }

  @Put(':id')
  updateExpense(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto, @Req() request: Request): ReturnType<ExpensesApi['updateExpense']> {
    return this.expensesApi.updateExpense(id, updateExpenseDto, request);
  }

  @Delete(':id')
  deleteExpense(@Param('id') id: string, @Req() request: Request): ReturnType<ExpensesApi['deleteExpense']> {
    return this.expensesApi.deleteExpense(id, request);
  }
}
