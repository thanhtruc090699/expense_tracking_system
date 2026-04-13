import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { OcrService } from './ocr.service';

@Controller('ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Get()
  async fetchOcr(
    @Query('url') url: string,
    @Query('language') language?: string,
  ) {
    if (!url) {
      throw new BadRequestException('Missing required query parameter: url');
    }
    return this.ocrService.fetchOcrFromUrl(url, language);
  }
}
