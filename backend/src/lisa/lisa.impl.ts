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
    const apiKey = process.env.LISA_API_KEY;
    if (!apiKey) {
      throw new ServiceUnavailableException('LISA_API_KEY not configured');
    }

    if (!chatRequest.messages || chatRequest.messages.length === 0) {
      throw new BadRequestException('Missing messages array');
    }

    try {
      return await this.lisaService.chat(
        apiKey,
        chatRequest.model || 'lisa-pro-03-2026',
        chatRequest.messages as any,
      );
    } catch (error: any) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new RequestTimeoutException('Request timed out');
      }
      if (error.response?.status === 429) {
        throw new HttpException(
          'Too many requests',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      if (error.response?.status === 422) {
        throw new UnprocessableEntityException('Unprocessable entity');
      }
      if (error.response?.status === 503) {
        throw new ServiceUnavailableException(
          'Service is currently unavailable',
        );
      }
      if (error.response?.status === 504) {
        throw new GatewayTimeoutException('Gateway timed out');
      }
      throw error;
    }
  }

  async lisaProcess(
    processRequest: ProcessRequest,
    request: Request,
  ): Promise<ProcessResponse> {
    const apiKey = process.env.LISA_API_KEY;
    if (!apiKey) {
      throw new ServiceUnavailableException('LISA_API_KEY not configured');
    }

    if (processRequest.data === undefined) {
      throw new BadRequestException('Missing data');
    }

    const DEFAULT_PROMPT =
      'You are a helpful assistant. Analyze the provided data and return a structured response with key insights.';
    const prompt = processRequest.prompt || DEFAULT_PROMPT;

    return await this.lisaService
      .processData(
        apiKey,
        processRequest.model || 'lisa-pro-03-2026',
        processRequest.data,
        prompt,
      )
      .then((result) => ({ result }))
      .catch((error: any) => {
        if (
          error.code === 'ECONNABORTED' ||
          error.message?.includes('timeout')
        ) {
          throw new RequestTimeoutException('Request timed out');
        }
        if (error.response?.status === 429) {
          throw new HttpException(
            'Too many requests',
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }
        if (error.response?.status === 422) {
          throw new UnprocessableEntityException('Unprocessable entity');
        }
        if (error.response?.status === 503) {
          throw new ServiceUnavailableException(
            'Service is currently unavailable',
          );
        }
        if (error.response?.status === 504) {
          throw new GatewayTimeoutException('Gateway timed out');
        }
        throw error;
      });
  }
}
