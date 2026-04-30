import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ScanResponse, Invoice, InvoiceItem, Row, RowBox, TaxLine, Totals, Meta, Spatial, Token } from '../generated/models';

@Injectable()
export class OcrService {
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('INVOICE_OCR_URL', 'http://localhost:8000/scan');
  }

  async scanInvoice(
    file: Buffer,
    filename: string,
    options: {
      lang?: string;
      psm?: number;
      oem?: number;
      minConf?: number;
      pdfMode?: string;
      includeTokens?: string;
    },
  ): Promise<any> {
    const formData = new FormData();
    
    const blob = new Blob([new Uint8Array(file)]);
    formData.append('file', blob, filename);
    
    if (options.lang) formData.set('lang', options.lang);
    if (options.psm !== undefined) formData.set('psm', String(options.psm));
    if (options.oem !== undefined) formData.set('oem', String(options.oem));
    if (options.minConf !== undefined) formData.set('min_conf', String(options.minConf));
    if (options.pdfMode) formData.set('pdf_mode', options.pdfMode);
    if (options.includeTokens) formData.set('include_tokens', options.includeTokens);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new HttpException(
          { message: data.error || 'OCR processing failed' },
          response.status,
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Failed to process OCR request';
      throw new HttpException({ message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
