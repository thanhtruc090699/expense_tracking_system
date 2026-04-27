import { Injectable } from '@nestjs/common';
import type { Bill, CreateBillDto, UpdateBillDto, DeleteBill200Response } from '../generated/models';
import { BillsApi } from '../generated/api/BillsApi';
import { BillsService } from './bills.service';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  roles: string[];
}

@Injectable()
export class BillsApiImpl extends BillsApi {
  constructor(private readonly billsService: BillsService) {
    super();
  }

  async createBill(createBillDto: CreateBillDto, request: Request): Promise<Bill> {
    const user = request['user'] as AuthUser;
    return this.billsService.create({ ...createBillDto, userId: user.id });
  }

  async findAllBills(userId: string | undefined, request: Request): Promise<Bill[]> {
    return this.billsService.findAll();
  }

  async findOneBill(id: string): Promise<Bill> {
    return this.billsService.findOne(id);
  }

  async updateBill(id: string, updateBillDto: UpdateBillDto): Promise<Bill> {
    return this.billsService.update(id, updateBillDto);
  }

  async deleteBill(id: string): Promise<DeleteBill200Response> {
    await this.billsService.delete(id);
    return { message: 'Bill deleted successfully' };
  }
}
