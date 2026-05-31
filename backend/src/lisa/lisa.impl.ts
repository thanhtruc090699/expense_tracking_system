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
  ChatRequest,
  ChatResponse,
  ProcessRequest,
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

  async lisaProcess(
    processRequest: ProcessRequest,
    request: Request,
  ): Promise<ProcessResponse> {
    return await this.lisaService
      .lisaProcess( processRequest, request)
  }
}
