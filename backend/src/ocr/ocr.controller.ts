import {
  Inject,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Request,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { ScanResponse, ProcessInvoiceRequestDto, ProcessInvoiceResponse, ProcessedInvoice } from '../generated/models';
import { OCRApi } from '../generated/api/OCRApi';
import { OCR_API_PROVIDER } from './ocr.constants';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { ProcessOcrInvoiceService } from './process-ocr-invoice.service';

@Controller('ocr')
@UseGuards(JwtGuard)
export class OcrController {
  constructor(
    @Inject(OCR_API_PROVIDER) private readonly ocrApi: OCRApi,
    private readonly processOcrInvoiceService: ProcessOcrInvoiceService,
  ) {}

  /**
   * @param file - Multipart file upload
   * @param body - Query parameters (lang, psm, oem, min_conf, pdf_mode, include_tokens)
   * @returns ScanResponse with OCR results
   */
  @Post('scan')
  @UseInterceptors(FileInterceptor('file'))
  async scanInvoice(
    @UploadedFile()
    file: { buffer: Buffer; originalname: string; mimetype: string },
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

  /**
   * @param file - Multipart file upload
   * @param requestDto - Query parameters (lang, psm, oem, min_conf, pdf_mode)
   * @param request - Express request with user info from JWT
   * @returns ProcessedInvoiceDto wrapped in response envelope
   */
  @Post('process-invoice')
  @UseInterceptors(FileInterceptor('file'))
  async processInvoice(
    @UploadedFile()
    file: { buffer: Buffer; originalname: string; mimetype: string },
    @Body() requestDto: ProcessInvoiceRequestDto,
    @Request() request: any,
  ): Promise<ProcessInvoiceResponse> {
    const scanResult = await this.ocrApi.scanInvoice(
      file.buffer as any,
      requestDto.lang || 'eng',
      requestDto.psm ?? 6,
      requestDto.oem ?? 1,
      requestDto.min_conf ?? 30,
      requestDto.pdf_mode || 'auto',
      '0',
      {} as Request,
    );

    const userId = request.user?.sub || request.user?.id;
    if (!userId) {
      throw new Error('User ID not found in JWT token');
    }

    const processedInvoice: ProcessedInvoice =
      await this.processOcrInvoiceService.processInvoice(
        scanResult as any,
        userId,
      );

    return {
      ok: true,
      data: processedInvoice,
    };
  }
}
