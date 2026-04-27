import { Inject, Body, Controller, Delete, Get, Post, Put, Param, Query, Req, UseGuards } from '@nestjs/common';
import type { Observable } from 'rxjs';
import type { Bill, CreateBillDto, DeleteBill200Response, UpdateBillDto } from '../generated/models';
import { BillsApi } from '../generated/api/BillsApi';
import { BILLS_API_PROVIDER } from './bills.constants';
import { JwtGuard } from '../auth/jwt/jwt.guard';

@Controller('bills')
@UseGuards(JwtGuard)
export class BillsController {
  constructor(@Inject(BILLS_API_PROVIDER) private readonly billsApi: BillsApi) {}

  @Post()
  createBill(@Body() createBillDto: CreateBillDto, @Req() request: Request): ReturnType<BillsApi['createBill']> {
    return this.billsApi.createBill(createBillDto, request);
  }

  @Get()
  findAllBills(@Query('userId') userId: string | undefined, @Req() request: Request): ReturnType<BillsApi['findAllBills']> {
    return this.billsApi.findAllBills(userId, request);
  }

  @Get(':id')
  findOneBill(@Param('id') id: string, @Req() request: Request): ReturnType<BillsApi['findOneBill']> {
    return this.billsApi.findOneBill(id, request);
  }

  @Put(':id')
  updateBill(@Param('id') id: string, @Body() updateBillDto: UpdateBillDto, @Req() request: Request): ReturnType<BillsApi['updateBill']> {
    return this.billsApi.updateBill(id, updateBillDto, request);
  }

  @Delete(':id')
  deleteBill(@Param('id') id: string, @Req() request: Request): ReturnType<BillsApi['deleteBill']> {
    return this.billsApi.deleteBill(id, request);
  }
}
