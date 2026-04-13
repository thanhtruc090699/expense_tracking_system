import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface OcrResponse {
  ParsedResults?: Array<{ ParsedText: string; FileParseExitCode: number }>;
  OCRExitCode?: number;
  IsErroredOnProcessing?: boolean;
  ErrorMessage?: string[];
  ErrorDetails?: string;
}

@Injectable()
export class OcrService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.ocr.space/parse/image';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OCR_API_KEY', 'helloworld');
  }

  async fetchOcrFromUrl(
    imageUrl: string,
    language = 'eng',
  ): Promise<OcrResponse> {
    const formData = new FormData();
    formData.set('apikey', this.apiKey);
    formData.set('url', imageUrl);
    formData.set('language', language);

    return this.callOcrApi(formData);
  }

  async fetchOcrFromFile(
    file: Buffer,
    filename: string,
    language = 'eng',
  ): Promise<OcrResponse> {
    const formData = new FormData();
    formData.set('apikey', this.apiKey);
    formData.set('language', language);
    const blob = new Blob([new Uint8Array(file)]);
    formData.append('file', blob, filename);

    return this.callOcrApi(formData);
  }

  private async callOcrApi(formData: FormData): Promise<OcrResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      const data = (await response.json()) as OcrResponse;

      if (!response.ok || data.IsErroredOnProcessing) {
        throw new HttpException(
          {
            message: data.ErrorMessage?.[0] ?? 'OCR processing failed',
            details: data,
          },
          response.status,
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to process OCR request';
      throw new HttpException({ message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
