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
  Patch,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import type {
  Budget,
  CreateBudgetDto,
  DeleteBudget200Response,
  UpdateBudgetDto,
} from '../generated/models';
import { BudgetsApi } from '../generated/api/BudgetsApi';
import { BUDGETS_API_PROVIDER } from './budgets.constants';
import { JwtGuard } from '../auth/jwt/jwt.guard';

@Controller('budgets')
@UseGuards(JwtGuard)
export class BudgetsController {
  constructor(
    @Inject(BUDGETS_API_PROVIDER) private readonly budgetsApi: BudgetsApi,
  ) {}

  @Post()
  createBudget(
    @Body() createBudgetDto: CreateBudgetDto,
    @Req() request: Request,
  ): ReturnType<BudgetsApi['createBudget']> {
    return this.budgetsApi.createBudget(createBudgetDto, request);
  }

  @Get()
  findAllBudgets(
    @Query('userId') userId: string | undefined,
    @Req() request: Request,
  ): ReturnType<BudgetsApi['findAllBudgets']> {
    return this.budgetsApi.findAllBudgets(userId, request);
  }

  @Get(':id')
  findOneBudget(
    @Param('id') id: string,
    @Req() request: Request,
  ): ReturnType<BudgetsApi['findOneBudget']> {
    return this.budgetsApi.findOneBudget(id, request);
  }

  @Put(':id')
  updateBudget(
    @Param('id') id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
    @Req() request: Request,
  ): ReturnType<BudgetsApi['updateBudget']> {
    return this.budgetsApi.updateBudget(id, updateBudgetDto, request);
  }

  @Patch(':id')
  partiallyUpdateBudget(
    @Param('id') id: string,
    @Body() updateBudgetDto: UpdateBudgetDto,
    @Req() request: Request,
  ): ReturnType<BudgetsApi['partiallyUpdateBudget']> {
    return this.budgetsApi.partiallyUpdateBudget(id, updateBudgetDto, request);
  }

  @Delete(':id')
  deleteBudget(
    @Param('id') id: string,
    @Req() request: Request,
  ): ReturnType<BudgetsApi['deleteBudget']> {
    return this.budgetsApi.deleteBudget(id, request);
  }
}
