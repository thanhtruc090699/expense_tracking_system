import { Inject, Controller, Post, Body, Req, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import type { Observable } from 'rxjs';
import type {
  ChatRequest,
  ChatResponse,
  ProcessResponse,
} from '../generated/models';
import { LisaApi } from '../generated/api/LisaApi';
import { LISA_API_PROVIDER } from './lisa.constants';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';

type LisaBillForm = {
  model?: string;
  prompt?: string;
  expenseId?: string;
};

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
    @Body() body: LisaBillForm,
    @Req() request: Request,
  ): ReturnType<LisaApi['lisaAnalyzeBill']> {
    return this.lisaApi.lisaAnalyzeBill(
      file as unknown as Blob,
      body.model,
      body.prompt,
      request,
    );
  }

  @Post('process-invoice')
  @UseInterceptors(FileInterceptor('file'))
  lisaProcessInvoice(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: LisaBillForm,
    @Req() request: Request,
  ): ReturnType<LisaApi['lisaProcessInvoice']> {
    return this.lisaApi.lisaProcessInvoice(
      file as unknown as Blob,
      body.model,
      body.prompt,
      body.expenseId,
      request,
    );
  }
}
