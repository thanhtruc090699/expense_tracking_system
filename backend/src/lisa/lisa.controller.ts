import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LisaService } from './lisa.service';

@Controller('lisa')
export class LisaController {
  constructor(
    private readonly lisaService: LisaService,
    private readonly configService: ConfigService,
  ) {}

  @Post('chat')
  async chat(
    @Body() body: { model?: string; messages: { role: string; content: string }[] },
  ) {
    const apiKey = this.configService.get<string>('LISA_API_KEY');
    if (!apiKey) {
      throw new BadRequestException('LISA_API_KEY not configured');
    }

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      throw new BadRequestException('Missing messages array');
    }

    return this.lisaService.chat(apiKey, body.model || 'lisa-pro-03-2026', body.messages);
  }
}