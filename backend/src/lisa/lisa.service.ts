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
import { ExpensesService } from '../expenses/expenses.service';
import { BudgetsService } from '../budgets/budgets.service';

interface Message {
  role: string;
  content: string;
}

@Injectable()
export class LisaService {
  private readonly lisaApiUrl =
    'https://chat-1.ki-awz.iisys.de/api/chat/completions';

  constructor(
    private readonly expensesService: ExpensesService,
    private readonly budgetsService: BudgetsService,
  ) {}

  private async getUserContext(userId: string): Promise<string> {
    try {
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const expenseSummary = await this.expensesService.getSummary(userId, currentMonth);
      const recentExpenses = await this.expensesService.findAll(userId);
      
      let budgets: any[] = [];
      try {
        budgets = await this.budgetsService.findAllBudgets(userId);
      } catch (budgetError) {
        console.error('[LisaService.getUserContext] budgets error:', budgetError);
      }

      const contextParts: string[] = [];

      // Monthly summary
      contextParts.push(`MONTHLY SUMMARY (${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}:`);
      contextParts.push(`- Total spent: €${expenseSummary.totalAmount.toFixed(2)}`);
      contextParts.push(`- Number of transactions: ${expenseSummary.transactionCount}`);
      contextParts.push(`- Average transaction: €${expenseSummary.averageTransactionAmount.toFixed(2)}`);
      
      if (expenseSummary.topTransactions.length > 0) {
        contextParts.push('- Top transactions:');
        expenseSummary.topTransactions.slice(0, 5).forEach((t) => {
          const merchantName = t.merchant?.name || 'Unknown';
          contextParts.push(`  • €${t.totalAmount.toFixed(2)} at ${merchantName} on ${new Date(t.expenseDate).toLocaleDateString()}`);
        });
      }
      contextParts.push('');

      // Recent expenses
      if (recentExpenses.length > 0) {
        contextParts.push('RECENT EXPENSES (last 10):');
        recentExpenses.slice(0, 10).forEach((e) => {
          const merchantName = e.merchant?.name || 'Unknown';
          const date = new Date(e.expenseDate).toLocaleDateString();
          contextParts.push(`- €${e.totalAmount.toFixed(2)} at ${merchantName} on ${date}${e.note ? ` (${e.note})` : ''}`);
        });
        contextParts.push('');
      }

      // Budgets
      if (budgets.length > 0) {
        contextParts.push('BUDGETS:');
        budgets.forEach((b) => {
          const categoryName = b.category?.name || 'General';
          const remaining = b.amount - expenseSummary.totalAmount;
          const percentUsed = ((expenseSummary.totalAmount / b.amount) * 100).toFixed(0);
          contextParts.push(`- ${categoryName}: €${b.amount.toFixed(2)} budget, €${remaining.toFixed(2)} remaining (${percentUsed}% used)`);
        });
        contextParts.push('');
      }

      return contextParts.join('\n');
    } catch (error) {
      console.error('[LisaService.getUserContext] error:', error);
      return 'Unable to load user financial data.';
    }
  }

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

    const user = request?.['user'] as { id: string } | undefined;
    const model = chatRequest.model || 'lisa-pro-03-2026';
    
    let messages: Array<{ role: string; content: string }> = [];
    
    if (user?.id) {
      const userContext = await this.getUserContext(user.id);
      
      const systemPrompt = `You are Lisa, a helpful financial assistant for Bill Buddy, an expense tracking application.

You have access to the user's financial data including:
- Monthly expense summary
- Recent transactions
- Budget information

Use this context to provide personalized financial insights and answer questions about their spending patterns.

USER CONTEXT:
${userContext}

---

When answering:
- Be concise and helpful
- Reference specific transactions or amounts when relevant
- Provide actionable financial advice
- If asked about spending patterns, use the provided data
- If you don't have enough information, ask clarifying questions`;

      messages.push({ role: 'system', content: systemPrompt });
      
      messages = messages.concat(
        chatRequest.messages.map((message) => ({
          role: message.role,
          content:
            typeof message.content === 'string'
              ? message.content
              : JSON.stringify(message.content, null, 2),
        }))
      );
    } else {
      const defaultSystemPrompt = `You are Lisa, a helpful financial assistant for Bill Buddy, an expense tracking application.

You help users with:
- Understanding their expenses
- Budget planning
- Financial tips and advice
- Answering questions about the app`;

      messages.push({ role: 'system', content: defaultSystemPrompt });
      
      messages = messages.concat(
        chatRequest.messages.map((message) => ({
          role: message.role,
          content:
            typeof message.content === 'string'
              ? message.content
              : JSON.stringify(message.content, null, 2),
        }))
      );
    }

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
        ...parseLisaContent(content) as ProcessResponse,
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
