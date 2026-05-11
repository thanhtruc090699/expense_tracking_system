import { Injectable } from '@nestjs/common';
import { OCRApi } from '../generated/api/OCRApi';
import type { ScanResponse } from '../generated/models';
import { OcrService } from './ocr.service';

@Injectable()
export class OcrApiImpl extends OCRApi {
  constructor(private readonly ocrService: OcrService) {
    super();
  }

  async scanInvoice(
    file: Blob | Buffer,
    lang: string | undefined,
    psm: number | undefined,
    oem: number | undefined,
    minConf: number | undefined,
    pdfMode: string | undefined,
    includeTokens: string | undefined,
    request: Request,
  ): Promise<ScanResponse> {
    const buffer = Buffer.isBuffer(file)
      ? file
      : Buffer.from(await file.arrayBuffer());
    const filename = (file as any).name || 'invoice.png';

    const result = await this.ocrService.scanInvoice(buffer, filename, {
      lang,
      psm,
      oem,
      minConf,
      pdfMode,
      includeTokens,
    });

    return result as ScanResponse;
  }
}
