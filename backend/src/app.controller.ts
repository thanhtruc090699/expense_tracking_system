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
import sharp from 'sharp';
import { AppService } from './app.service';
import { OcrService } from './ocr/ocr.service';

const MAX_FILE_SIZE = 1024 * 1024;

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

  @Post('scan-legacy')
  @UseInterceptors(FileInterceptor('file'))
  async scanFromFile(
    @UploadedFile() file: { buffer: Buffer; originalname: string } | undefined,
    @Query('language') language?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Missing file upload');
    }

    let fileBuffer = file.buffer;
    const originalSize = fileBuffer.length;

    if (originalSize > MAX_FILE_SIZE) {
      const initialImage = sharp(fileBuffer);
      const metadata = await initialImage.metadata();

      let width = metadata.width;
      let height = metadata.height;
      let quality = 80;

      while (fileBuffer.length > MAX_FILE_SIZE && quality > 30) {
        if (width && height) {
          const scale = Math.sqrt(MAX_FILE_SIZE / fileBuffer.length) * 1.1;
          width = Math.floor(width * scale);
          height = Math.floor(height * scale);
        }
        fileBuffer = await sharp(fileBuffer)
          .resize(width, height, { fit: 'inside' })
          .jpeg({ quality })
          .toBuffer();
        quality -= 10;
      }

      if (fileBuffer.length > MAX_FILE_SIZE) {
        throw new BadRequestException(
          'Unable to compress file below 1024KB limit',
        );
      }
    }

    return this.ocrService.scanInvoice(fileBuffer, file.originalname, {
      lang: language || 'eng',
    });
  }
}
