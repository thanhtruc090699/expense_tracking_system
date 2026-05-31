import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { OcrController } from './ocr.controller';
import { OcrService } from './ocr.service';
import { OcrApiImpl } from './ocr.impl';
import { ProcessOcrInvoiceService } from './process-ocr-invoice.service';
import { OCR_API_PROVIDER } from './ocr.constants';
import { MerchantsModule } from '../merchants/merchants.module';
import { ExpensesModule } from '../expenses/expenses.module';
import { ExpenseItemsModule } from '../expense-items/expense-items.module';

@Module({
  imports: [
    ConfigModule,
    JwtModule,
    MerchantsModule,
    ExpensesModule,
    ExpenseItemsModule,
  ],
  controllers: [OcrController],
  providers: [
    OcrService,
    ProcessOcrInvoiceService,
    {
      provide: OCR_API_PROVIDER,
      useClass: OcrApiImpl,
    },
  ],
  exports: [OCR_API_PROVIDER, OcrService, ProcessOcrInvoiceService],
})
export class OcrModule {}
