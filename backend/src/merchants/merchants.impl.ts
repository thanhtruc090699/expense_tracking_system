import { Injectable } from '@nestjs/common';
import type {
  Merchant,
  CreateMerchantDto,
  UpdateMerchantDto,
} from '../generated/models';
import { MerchantsApi } from '../generated/api/MerchantsApi';
import { MerchantsService } from './merchants.service';

@Injectable()
export class MerchantsApiImpl extends MerchantsApi {
  constructor(private readonly merchantsService: MerchantsService) {
    super();
  }

  async createMerchant(
    createMerchantDto: CreateMerchantDto,
    request: Request,
  ): Promise<Merchant> {
    const merchant = await this.merchantsService.create(createMerchantDto);
    return this.toMerchant(merchant);
  }

  async findAllMerchants(request: Request): Promise<Merchant[]> {
    const merchants = await this.merchantsService.findAll();
    return merchants.map((m) => this.toMerchant(m));
  }

  async findOneMerchant(id: string): Promise<Merchant> {
    const merchant = await this.merchantsService.findOne(id);
    return this.toMerchant(merchant);
  }

  async updateMerchant(
    id: string,
    updateMerchantDto: UpdateMerchantDto,
  ): Promise<Merchant> {
    const merchant = await this.merchantsService.update(id, updateMerchantDto);
    return this.toMerchant(merchant);
  }

  private toMerchant(merchant: any): Merchant {
    return {
      ...merchant,
      createdAt: merchant.createdAt.toISOString(),
    };
  }
}
