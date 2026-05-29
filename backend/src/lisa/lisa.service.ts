import {
  Injectable,
  HttpException,
  HttpStatus,
  ServiceUnavailableException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import type {
  ChatRequest,
  ChatResponse,
  ProcessRequest,
  ProcessResponse,
} from '../generated/models';
import { parseLisaContent } from './utils/parse-lisa-content.util';
import { handleLisaError } from './utils/lisa-error.util';

interface Message {
  role: string;
  content: string;
}

@Injectable()
export class LisaService {
  private readonly lisaApiUrl =
    'https://chat-1.ki-awz.iisys.de/api/chat/completions';

  async lisaChat(
    chatRequest: ChatRequest,
    request?: Request,
  ): Promise<ChatResponse> {
    const apiKey = process.env.LISA_API_KEY?.trim();

    console.log('[LisaService.lisaChat] apikey:', {
      exists: Boolean(apiKey),
      length: apiKey?.length,
      startsWith: apiKey?.slice(0, 8),
      endsWith: apiKey?.slice(-4),
    });

    if (!apiKey) {
      throw new ServiceUnavailableException('LISA_API_KEY not configured');
    }

    if (!chatRequest.messages || chatRequest.messages.length === 0) {
      throw new BadRequestException('Messages array cannot be empty');
    }

    const model = chatRequest.model || 'lisa-pro-03-2026';
    const messages = chatRequest.messages.map((message) => ({
      role: message.role,
      content:
        typeof message.content === 'string'
          ? message.content
          : JSON.stringify(message.content, null, 2),
    }));

    const payload = {
      model,
      messages,
    };

    console.log('[LisaService.lisaChat] request:', {
      url: this.lisaApiUrl,
      model: payload.model,
      messageCount: payload.messages.length,
      firstRole: payload.messages[0]?.role,
      secondRole: payload.messages[1]?.role,
      authPreview: `Bearer ${apiKey}`.slice(0, 18),
      payloadPreview: JSON.stringify(payload).slice(0, 500),
    });

    const response = await fetch(this.lisaApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    console.log('[LisaService.lisaChat] response:', {
      status: response.status,
      statusText: response.statusText,
      body: responseText,
    });

    if (!response.ok) {
      throw new HttpException(
        {
          message: 'Lisa API error',
          status: response.status,
          statusText: response.statusText,
          body: responseText,
        },
        response.status,
      );
    }

    try {
      return JSON.parse(responseText) as ChatResponse;
    } catch {
      throw new HttpException(
        {
          message: 'Invalid JSON response from Lisa API',
          body: responseText,
        },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async lisaProcess(
    processRequest: ProcessRequest,
    request?: Request,
  ): Promise<ProcessResponse> {
    console.log('[LisaService.lisaProcess] called');
    const apiKey = process.env.LISA_API_KEY?.trim();

    if (!apiKey) {
      throw new ServiceUnavailableException('LISA_API_KEY not configured');
    }

    if (processRequest.data === undefined || processRequest.data === null) {
      throw new BadRequestException('Invalid request data');
    }

    const model = processRequest.model || 'lisa-pro-03-2026';

    const defaultPrompt = `
You are an OCR result validation and categorization assistant.

You receive OCR output from a receipt or invoice.
You do not receive the original image or PDF.
Your job is to validate the OCR result, extract/display line items from OCR text when possible, suggest an expense category, and return the final display result.

Use OCR rows/raw text only.
Do not invent values that are not supported by OCR text.
If item price is not visible, set unitPrice and totalPrice to null.
If quantity is not visible, set quantity to null.
If OCR text is unclear, keep confidence low.

Validate:
- vendor
- total amount
- currency
- line items
- item prices
- line item sum vs total

Line item rules:
- Return visible product/service rows as items.
- For each item, include name, quantity, unitPrice, totalPrice, categoryName, confidence, and status.
- If a product name is visible but price is missing, still return the item with price fields as null and status "missing_price".
- Do not create fake item prices from the invoice total unless there is exactly one clear item and the OCR text strongly supports that the total belongs to that item.
- If there is exactly one visible item and no separate item price is found, you may set totalPrice equal to totalAmount only when there are no other visible purchasable items. Set confidence below 0.8 and explain in auditMessage.
- Treat "€2,92", "2,92", and "2.92" as the same amount.

Category rules:
- Suggest one overall expense category using vendor name, visible item text, receipt context, and total amount if useful.
- Also suggest categoryName for each item when possible.
- Prefer practical personal finance categories.
- If vendor is a pharmacy/drugstore/beauty retailer, suggest "Personal Care" or "Health & Beauty".
- If line item text is unclear, use vendor context but lower confidence.
- Return alternatives if there are plausible categories.
- Do not create overly specific categories unless strongly supported.

Validation rules:
- If vendor and total are found but item prices are missing, status must be "needs_review".
- If vendor or total cannot be verified, status must be "invalid".
- If vendor, total, items, and item prices are reliable, status must be "valid".
- Keep audit messages short and useful.
- Return JSON only.

Return exactly:
{
  "status": "valid" | "needs_review" | "invalid",
  "valid": boolean,
  "vendor": string | null,
  "totals": {
    "totalAmount": number | null,
    "itemsDeclared": number | null,
    "lineItemsSum": number | null,
    "difference": number | null,
    "matches": boolean | null
  },
  "items": [
    {
      "name": string | null,
      "quantity": number | null,
      "unitPrice": number | null,
      "totalPrice": number | null,
      "categoryName": string | null,
      "confidence": number,
      "status": "ok" | "missing_price" | "uncertain"
    }
  ],
  "checks": {
    "vendorMatched": boolean,
    "totalMatched": boolean,
    "itemsDetected": boolean,
    "itemPricesDetected": boolean,
    "sumMatched": boolean | null
  },
  "categorySuggestion": {
    "categoryName": string | null,
    "confidence": number,
    "reason": string,
    "alternatives": string[]
  },
  "auditMessage": string,
  "issues": [
    {
      "field": string,
      "severity": "info" | "warning" | "error",
      "message": string
    }
  ]
}
`;
    const prompt = processRequest.prompt || defaultPrompt;

    const input =
      typeof processRequest.data === 'string'
        ? processRequest.data
        : JSON.stringify(processRequest.data, null, 2);

    const messages: ChatRequest['messages'] = [
      {
        role: 'system',
        content: prompt,
      },
      {
        role: 'user',
        content: `OCR extraction result:\n\n${input}`,
      },
    ];

    try {
      const chatRequest: ChatRequest = {
        model,
        messages,
      };

      const result = await this.lisaChat(chatRequest, request);

      const content = result.choices?.[0]?.message?.content;

      if (!content) {
        throw new InternalServerErrorException('LISA returned empty response');
      }

      return {
        ...parseLisaContent(content),
      };
    } catch (error: any) {
      console.error('[LisaService.lisaProcess] error:', {
        name: error?.name,
        message: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        stack: error?.stack,
      });
      handleLisaError(error);
    }
  }
}
