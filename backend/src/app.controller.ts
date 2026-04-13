import {
  Controller,
  Get,
  Post,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AppService } from './app.service';
import { OcrService } from './ocr/ocr.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly ocrService: OcrService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('scan')
  async scanFromUrl(
    @Query('url') url: string,
    @Query('language') language?: string,
  ) {
    if (!url) {
      throw new BadRequestException('Missing required query parameter: url');
    }
    return this.ocrService.fetchOcrFromUrl(url, language);
  }

  @Post('scan')
  @UseInterceptors(FileInterceptor('file'))
  async scanFromFile(
    @UploadedFile() file: { buffer: Buffer; originalname: string } | undefined,
    @Query('language') language?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Missing file upload');
    }
    return this.ocrService.fetchOcrFromFile(
      file.buffer,
      file.originalname,
      language,
    );
  }
}
