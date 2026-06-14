import { Inject, Controller, Post, Body, Req, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import type { Observable } from 'rxjs';
import type {
  ChatRequest,
  ChatResponse,
  ProcessResponse,
  ValidateBillRequest,
} from '../generated/models';
import { LisaApi } from '../generated/api/LisaApi';
import { LISA_API_PROVIDER } from './lisa.constants';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('lisa')
@UseGuards(JwtGuard)
export class LisaController {
  constructor(@Inject(LISA_API_PROVIDER) private readonly lisaApi: LisaApi) {}

  @Post('chat')
  lisaChat(
    @Body() chatRequest: ChatRequest,
    @Req() request: Request,
  ): ReturnType<LisaApi['lisaChat']> {
    return this.lisaApi.lisaChat(chatRequest, request);
  }

  @Post('analyze-bill')
  @UseInterceptors(FileInterceptor('file'))
  lisaAnalyzeBill(
    @UploadedFile() file: Express.Multer.File,
    @Body() validateBillRequest: ValidateBillRequest,
    @Req() request: Request,
  ): ReturnType<LisaApi['lisaAnalyzeBill']> {
    return this.lisaApi.lisaAnalyzeBill(validateBillRequest, request);
  }
}
