import {
  Inject,
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { CreateMerchantDto, UpdateMerchantDto } from '../generated/models';
import { MerchantsApi } from '../generated/api/MerchantsApi';
import { MERCHANTS_API_PROVIDER } from './merchants.constants';
import { JwtGuard } from '../auth/jwt/jwt.guard';

@Controller('merchants')
@UseGuards(JwtGuard)
export class MerchantsController {
  constructor(
    @Inject(MERCHANTS_API_PROVIDER) private readonly merchantsApi: MerchantsApi,
  ) {}

  @Post()
  createMerchant(
    @Body() createMerchantDto: CreateMerchantDto,
    @Req() request: Request,
  ): ReturnType<MerchantsApi['createMerchant']> {
    return this.merchantsApi.createMerchant(createMerchantDto, request);
  }

  @Get()
  findAllMerchants(
    @Req() request: Request,
  ): ReturnType<MerchantsApi['findAllMerchants']> {
    return this.merchantsApi.findAllMerchants(request);
  }

  @Get('search')
  searchMerchants(
    @Query('name') name: string,
    @Req() request: Request,
  ): ReturnType<MerchantsApi['searchMerchants']> {
    return this.merchantsApi.searchMerchants(name, request);
  }

  @Get(':id')
  findOneMerchant(
    @Param('id') id: string,
    @Req() request: Request,
  ): ReturnType<MerchantsApi['findOneMerchant']> {
    return this.merchantsApi.findOneMerchant(id, request);
  }

  @Put(':id')
  updateMerchant(
    @Param('id') id: string,
    @Body() updateMerchantDto: UpdateMerchantDto,
    @Req() request: Request,
  ): ReturnType<MerchantsApi['updateMerchant']> {
    return this.merchantsApi.updateMerchant(id, updateMerchantDto, request);
  }
}
