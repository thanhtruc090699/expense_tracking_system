import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { OcrController } from './ocr.controller';
import { OcrService } from './ocr.service';
import { OcrApiImpl } from './ocr.impl';
import { OCR_API_PROVIDER } from './ocr.constants';

@Module({
  imports: [ConfigModule, JwtModule],
  controllers: [OcrController],
  providers: [
    OcrService,
    {
      provide: OCR_API_PROVIDER,
      useClass: OcrApiImpl,
    },
  ],
  exports: [OCR_API_PROVIDER, OcrService],
})
export class OcrModule {}
