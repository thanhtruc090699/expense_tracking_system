import { Inject, Controller, Post, UseGuards, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { ScanResponse } from '../generated/models';
import { OCRApi } from '../generated/api/OCRApi';
import { OCR_API_PROVIDER } from './ocr.constants';
import { JwtGuard } from '../auth/jwt/jwt.guard';

@Controller('ocr')
@UseGuards(JwtGuard)
export class OcrController {
  constructor(@Inject(OCR_API_PROVIDER) private readonly ocrApi: OCRApi) {}

  @Post('scan')
  @UseInterceptors(FileInterceptor('file'))
  async scanInvoice(
    @UploadedFile() file: { buffer: Buffer; originalname: string; mimetype: string },
    @Body() body: any,
  ): Promise<ScanResponse> {
    const result = await this.ocrApi.scanInvoice(
      file.buffer as any,
      body.lang,
      body.psm ? Number(body.psm) : undefined,
      body.oem ? Number(body.oem) : undefined,
      body.min_conf ? Number(body.min_conf) : undefined,
      body.pdf_mode,
      body.include_tokens,
      {} as Request,
    );
    
    return result as ScanResponse;
  }
}
