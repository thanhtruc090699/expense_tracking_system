import { Inject, Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import type { Observable } from 'rxjs';
import type {
  ChatRequest,
  ChatResponse,
  ProcessRequest,
  ProcessResponse,
} from '../generated/models';
import { LisaApi } from '../generated/api/LisaApi';
import { LISA_API_PROVIDER } from './lisa.constants';
import { JwtGuard } from '../auth/jwt/jwt.guard';

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

  @Post('process')
  lisaProcess(
    @Body() processRequest: ProcessRequest,
    @Req() request: Request,
  ): ReturnType<LisaApi['lisaProcess']> {
    return this.lisaApi.lisaProcess(processRequest, request);
  }
}
