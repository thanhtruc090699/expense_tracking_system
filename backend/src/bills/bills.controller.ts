import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { BillsService } from './bills.service';

@Controller('bills')
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post()
  create(
    @Body()
    body: {
      fileUrl: string;
      fileType: string;
      ocrData?: object;
      userId: string;
    },
  ) {
    return this.billsService.create(body);
  }

  @Get()
  findAll(@Query('userId') userId?: string) {
    return this.billsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.billsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      fileUrl?: string;
      fileType?: string;
      ocrData?: object;
      isDuplicate?: boolean;
    },
  ) {
    return this.billsService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.billsService.delete(id);
  }
}
