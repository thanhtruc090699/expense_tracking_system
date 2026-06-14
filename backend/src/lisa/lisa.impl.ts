import {
  Injectable,
  BadRequestException,
  ServiceUnavailableException,
  GatewayTimeoutException,
  UnprocessableEntityException,
  RequestTimeoutException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type {
  AiProcessInvoiceResponse,
  ChatRequest,
  ChatResponse,
  ProcessResponse,
} from '../generated/models';
import { LisaApi } from '../generated/api/LisaApi';
import { LisaService } from './lisa.service';

@Injectable()
export class LisaApiImpl extends LisaApi {
  constructor(private readonly lisaService: LisaService) {
    super();
  }

  async lisaChat(
    chatRequest: ChatRequest,
    request: Request,
  ): Promise<ChatResponse> {
    return await this.lisaService.lisaChat(chatRequest, request);
  }

  async lisaAnalyzeBill(
    file: Blob,
    model: string | undefined,
    prompt: string | undefined,
    request: Request,
  ): Promise<ProcessResponse> {
    return await this.lisaService.lisaAnalyzeBill(
      file,
      model,
      prompt,
      request,
    );
  }

  async lisaProcessInvoice(
    file: Blob,
    model: string | undefined,
    prompt: string | undefined,
    request: Request,
  ): Promise<AiProcessInvoiceResponse> {
    return await this.lisaService.lisaProcessInvoice(
      file,
      model,
      prompt,
      request,
    );
  }
}
