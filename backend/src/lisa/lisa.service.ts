import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

interface Message {
  role: string;
  content: string;
}

@Injectable()
export class LisaService {
  private readonly lisaApiUrl =
    'https://chat-1.ki-awz.iisys.de/api/chat/completions';

  async chat(apiKey: string, model: string, messages: Message[]) {
    try {
      const response = await fetch(this.lisaApiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model, messages }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new HttpException(
          { message: 'Lisa API error', details: data },
          response.status,
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      const message =
        error instanceof Error ? error.message : 'Failed to call Lisa API';
      throw new HttpException({ message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async processData(
    apiKey: string,
    model: string,
    data: unknown,
    prompt: string,
  ) {
    const messages: Message[] = [
      { role: 'system', content: prompt },
      { role: 'user', content: JSON.stringify(data, null, 2) },
    ];
    return this.chat(apiKey, model, messages);
  }
}
