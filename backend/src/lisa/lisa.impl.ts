import { Injectable } from '@nestjs/common';
import type { ChatRequest, ChatResponse, ProcessRequest, ProcessResponse } from '../generated/models';
import { LisaApi } from '../generated/api/LisaApi';
import { LisaService } from './lisa.service';

@Injectable()
export class LisaApiImpl extends LisaApi {
  constructor(private readonly lisaService: LisaService) {
    super();
  }

  async lisaChat(chatRequest: ChatRequest, request: Request): Promise<ChatResponse> {
    const apiKey = process.env.LISA_API_KEY;
    if (!apiKey) {
      throw new Error('LISA_API_KEY not configured');
    }

    if (!chatRequest.messages || chatRequest.messages.length === 0) {
      throw new Error('Missing messages array');
    }

    return this.lisaService.chat(
      apiKey,
      chatRequest.model || 'lisa-pro-03-2026',
      chatRequest.messages as any,
    );
  }

  async lisaProcess(processRequest: ProcessRequest, request: Request): Promise<ProcessResponse> {
    const apiKey = process.env.LISA_API_KEY;
    if (!apiKey) {
      throw new Error('LISA_API_KEY not configured');
    }

    if (processRequest.data === undefined) {
      throw new Error('Missing data');
    }

    const DEFAULT_PROMPT = 'You are a helpful assistant. Analyze the provided data and return a structured response with key insights.';
    const prompt = processRequest.prompt || DEFAULT_PROMPT;

    const result = await this.lisaService.processData(
      apiKey,
      processRequest.model || 'lisa-pro-03-2026',
      processRequest.data,
      prompt,
    );

    return { result };
  }
}
