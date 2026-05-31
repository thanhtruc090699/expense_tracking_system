import type { request } from 'express';

import {
  Inject,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import type {
  CreateExpenseItemDto,
  UpdateExpenseItemDto,
} from '../generated/models';

import { ExpenseItemsApi } from '../generated/api/ExpenseItemsApi';
import { EXPENSE_ITEMS_API_PROVIDER } from './expense-items.constants';
import { JwtGuard } from '../auth/jwt/jwt.guard';

@Controller('expense-items')
//@UseGuards(JwtGuard)
export class ExpenseItemsController {
  constructor(
    @Inject(EXPENSE_ITEMS_API_PROVIDER)
    private readonly expenseItemsApi: ExpenseItemsApi,
  ) {}

  @Post()
  createExpenseItem(
    @Body() createExpenseItemDto: CreateExpenseItemDto,
    @Req() request: Request,
  ): ReturnType<ExpenseItemsApi['createExpenseItem']> {
    return this.expenseItemsApi.createExpenseItem(
      createExpenseItemDto,
      request,
    );
  }

  @Get()
  findAllExpenseItems(
    @Query('expenseId') expenseId: string | undefined,
    @Req() request: Request,
  ): ReturnType<ExpenseItemsApi['findAllExpenseItems']> {
    return this.expenseItemsApi.findAllExpenseItems(
      expenseId,
      request,
    );
  }

  @Get(':id')
  findOneExpenseItem(
    @Param('id') id: string,
    @Req() request: Request,
  ): ReturnType<ExpenseItemsApi['findOneExpenseItem']> {
    return this.expenseItemsApi.findOneExpenseItem(
      id,
      request,
    );
  }

  @Put(':id')
  updateExpenseItem(
    @Param('id') id: string,
    @Body() updateExpenseItemDto: UpdateExpenseItemDto,
    @Req() request: Request,
  ): ReturnType<ExpenseItemsApi['updateExpenseItem']> {
    return this.expenseItemsApi.updateExpenseItem(
      id,
      updateExpenseItemDto,
      request,
    );
  }

  @Delete(':id')
  deleteExpenseItem(
    @Param('id') id: string,
    @Req() request: Request,
  ): ReturnType<ExpenseItemsApi['deleteExpenseItem']> {
    return this.expenseItemsApi.deleteExpenseItem(
      id,
      request,
    );
  }
}