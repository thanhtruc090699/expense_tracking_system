import {
  Injectable,
  HttpException,
  HttpStatus,
  ServiceUnavailableException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import type {
  AiValidatedInvoice,
  ExpenseItem,
  ChatRequest,
  ChatResponse,
  ProcessResponse,
  AiProcessInvoiceResponse,
} from '../generated/models';
import { parseLisaContent } from './utils/parse-lisa-content.util';
import { handleLisaError } from './utils/lisa-error.util';
import { ExpensesService } from '../expenses/expenses.service';
import { MerchantsService } from '../merchants/merchants.service';
import { ExpenseItemsService } from '../expense-items/expense-items.service';
import { BudgetsService } from '../budgets/budgets.service';
import { Multer } from 'multer';
import { prisma } from '../prisma';
import { CacheService } from '../cache/cache.service';
import { TTL_CONFIG } from '../cache/cache.strategy';
import { createHash } from 'crypto';

type LisaMessageContent = ChatRequest['messages'][number]['content'];

@Injectable()
export class LisaService {
  private readonly lisaApiUrl =
    'https://chat-1.ki-awz.iisys.de/api/chat/completions';

  constructor(
    private readonly cacheService: CacheService,
    private readonly expensesService: ExpensesService,
    private readonly budgetsService: BudgetsService,
    private readonly merchantsService: MerchantsService,
    private readonly expenseItemsService: ExpenseItemsService,
  ) {}

  private async getUserContext(
    userId: string,
    request?: Request,
  ): Promise<string> {
    const cacheKey = `user:${userId}:lisa:context`;
    
    const cached = await this.cacheService.get<{ content: string; hash: string }>(cacheKey);
    if (cached) {
      const currentHash = await this.computeContextDataHash(userId, request);
      if (cached.hash === currentHash) {
        return cached.content;
      }
    }

    try {
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const expenseSummary = await this.expensesService.getSummary(
        userId,
        currentMonth,
      );
      const spendingSummary = await this.expensesService.getSpendingSummary(
        userId,
        currentMonth,
      );
      const recentExpenses = await this.expensesService.findAll({
        userId,
        limit: 10,
      });

      let budgets: any[] = [];
      try {
        budgets = await this.budgetsService.findAllBudgets(userId, request);
      } catch (budgetError) {
        console.error(
          '[LisaService.getUserContext] budgets error:',
          budgetError,
        );
      }

      const contextParts: string[] = [];

      // Monthly summary
      contextParts.push(
        `MONTHLY SUMMARY (${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}:`,
      );
      contextParts.push(
        `- Total spent: €${expenseSummary.totalAmount.toFixed(2)}`,
      );
      contextParts.push(
        `- Number of transactions: ${expenseSummary.transactionCount}`,
      );
      contextParts.push(
        `- Average transaction: €${expenseSummary.averageTransactionAmount.toFixed(2)}`,
      );

      if (expenseSummary.topTransactions.length > 0) {
        contextParts.push('- Top transactions:');
        expenseSummary.topTransactions.slice(0, 5).forEach((t) => {
          const merchantName = t.merchant?.name || 'Unknown';
          contextParts.push(
            `  • €${t.totalAmount.toFixed(2)} at ${merchantName} on ${new Date(t.expenseDate).toLocaleDateString()}`,
          );
        });
      }
      contextParts.push('');

      // Recent expenses
      if (recentExpenses.length > 0) {
        contextParts.push('RECENT EXPENSES (last 10):');
        recentExpenses.slice(0, 10).forEach((e) => {
          const merchantName = e.merchant?.name || 'Unknown';
          const date = new Date(e.expenseDate).toLocaleDateString();
          contextParts.push(
            `- €${e.totalAmount.toFixed(2)} at ${merchantName} on ${date}${e.note ? ` (${e.note})` : ''}`,
          );
        });
        contextParts.push('');
      }

      // Budgets
      const currentMonthBudgets = budgets.filter((budget) => {
        if (!budget.endDate) return false;
        const endDate = new Date(budget.endDate);
        return (
          endDate.getFullYear() === currentMonth.getFullYear() &&
          endDate.getMonth() === currentMonth.getMonth()
        );
      });

      if (currentMonthBudgets.length > 0) {
        contextParts.push(
          `BUDGETS (${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}):`,
        );
        currentMonthBudgets.forEach((b) => {
          const categoryName = b.category?.name || 'General';
          const categorySpent =
            spendingSummary.categoryBreakdown.find(
              (category) => category.categoryId === b.categoryId,
            )?.amount ?? 0;
          const remaining = b.amount - categorySpent;
          const percentUsed =
            b.amount > 0 ? ((categorySpent / b.amount) * 100).toFixed(0) : '0';
          contextParts.push(
            `- ${categoryName}: €${b.amount.toFixed(2)} budget, €${categorySpent.toFixed(2)} spent, €${remaining.toFixed(2)} remaining (${percentUsed}% used, warning threshold ${b.notifyThreshold ?? 80}%)`,
          );
        });
        contextParts.push('');
      }

      const content = contextParts.join('\n');
      const hash = await this.computeContextDataHash(userId, request);
      
      await this.cacheService.set(
        cacheKey,
        { content, hash },
        TTL_CONFIG.LISA_CONTEXT,
        [`tag:user:${userId}:lisa:context`, `tag:user:${userId}:expenses`, `tag:user:${userId}:budgets`],
      );
      
      return content;
    } catch (error) {
      console.error('[LisaService.getUserContext] error:', error);
      return 'Unable to load user financial data.';
    }
  }

  private async computeContextDataHash(userId: string, request?: Request): Promise<string> {
    try {
      const now = new Date();
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const [expenseSummary, spendingSummary, recentExpenses, budgets] = await Promise.all([
        this.expensesService.getSummary(userId, currentMonth),
        this.expensesService.getSpendingSummary(userId, currentMonth),
        this.expensesService.findAll({ userId, limit: 10 }),
        this.budgetsService.findAllBudgets(userId, request).catch(() => []),
      ]);

      const hashContent = JSON.stringify({
        totalAmount: expenseSummary.totalAmount,
        transactionCount: expenseSummary.transactionCount,
        spendingTotal: spendingSummary.totalAmount,
        categoryCount: spendingSummary.categoryBreakdown.length,
        expensesCount: recentExpenses.length,
        lastExpenseDate: recentExpenses[0]?.expenseDate,
        budgetsCount: budgets.length,
        budgetsTotal: (budgets as any[]).reduce((sum, b) => sum + Number(b.amount || 0), 0),
      });

      return createHash('sha256').update(hashContent).digest('hex');
    } catch (error) {
      console.error('[LisaService.computeContextDataHash] error:', error);
      return 'error';
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

    let messages: Array<{ role: string; content: LisaMessageContent }> = [];

    if (user?.id) {
      const userContext = await this.getUserContext(user.id, request);

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
          content: message.content,
        })),
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
          content: message.content,
        })),
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

  async lisaAnalyzeBill(
    uploadedFile: Blob,
    model: string | undefined,
    customPrompt: string | undefined,
    request?: Request,
  ): Promise<ProcessResponse> {
    console.log('[LisaService.lisaAnalyzeBill] called');
    const apiKey = process.env.LISA_API_KEY?.trim();

    if (!apiKey) {
      throw new ServiceUnavailableException('LISA_API_KEY not configured');
    }

    const selectedModel = model || 'lisa-pro-03-2026';
    const file = uploadedFile as unknown as Express.Multer.File;

    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException(
        'Only image files are supported for Lisa bill analysis at this stage',
      );
    }

    const [ocrResult, categories] = await Promise.all([
      this.scanInvoiceWithOcr(file),
      prisma.category.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    const invoice = ocrResult?.data?.invoice;

    if (!invoice) {
      throw new BadRequestException('OCR response is missing invoice data');
    }

    const compactOcr = {
      vendor: invoice.vendor ?? null,
      totals: {
        totalAmount: invoice.totals?.total_amount ?? null,
        lineItemsSum: invoice.totals?.line_items_sum ?? null,
        lineSumMatchesTotal: invoice.totals?.line_sum_matches_total ?? null,
      },
      items: Array.isArray(invoice.items)
        ? invoice.items.map((item) => ({
            name: item.item_name,
            quantity: item.quantity,
            unitPrice: item.quantity
              ? Number((Number(item.final_amount ?? 0) / item.quantity).toFixed(2))
              : null,
            totalPrice: item.final_amount,
          }))
        : [],
    };

    const input = JSON.stringify(
      {
        file: {
          filename: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
        },
        categories,
        ocr: compactOcr,
      },
      null,
      2,
    );

    const fileBase64 = file.buffer.toString('base64');

    const defaultPrompt = `
You validate a receipt by reading the original image and comparing it with OCR invoice data.
You receive:
1. The original receipt image.
2. The OCR invoice extracted by the backend.
3. The allowed category list from Bill Buddy.

Use the image as the source of truth. Use OCR as a baseline to compare against and to avoid missing visible line items.
Return one validated invoice.

Extraction requirements:
- Return only real purchasable products or services as items.
- Exclude loyalty cards, customer cards, vouchers, coupons, discounts, cashback, Pfand/deposit summary lines, tax/VAT lines, subtotal lines, total lines, payment/card/cash/change lines, invoice metadata, and informational receipt text.
- Do not create an item for "Kaufland Card", customer numbers, receipt numbers, payment method, tax, discount, or totals.
- Keep product names close to OCR text, but remove obvious receipt codes when they are not part of the product name.
- If quantity is missing but the OCR line is clearly a single product with one line price, set quantity to 1 and unitPrice equal to totalPrice.
- If quantity is explicit, use it. If totalPrice is present and unitPrice is missing, calculate unitPrice only when quantity is numeric and greater than 0.
- If price is missing, keep unitPrice and totalPrice null and set status to "missing_price".
- If OCR includes a line that is not a real product/service after checking the image, exclude it.
- If OCR misses a real product/service visible in the image, include it.

Validation rules:
- validationStatus is "valid" when merchant, totalAmount, and at least one real item are reliable.
- validationStatus is "needs_review" when some item names/prices are uncertain but usable.
- validationStatus is "invalid" when merchant or totalAmount is missing.

Category rules:
- Choose categoryName and categoryId only from the provided categories array.
- If no category fits, set categoryName and categoryId to null.

Return JSON only. Do not include markdown.
Return exactly:
{
  "invoice": {
    "merchant": string | null,
    "totalAmount": number | null,
    "date": string | null,
    "currency": string | null,
    "items": [
      {
        "name": string | null,
        "quantity": number | null,
        "unitPrice": number | null,
        "totalPrice": number | null,
        "categoryName": string | null,
        "categoryId": string | null,
        "confidence": number,
        "status": "ok" | "missing_price" | "uncertain"
      }
    ],
    "validationStatus": "valid" | "needs_review" | "invalid"
  }
}
`;
    const prompt = customPrompt || defaultPrompt;

    const messages: ChatRequest['messages'] = [
      {
        role: 'system',
        content: prompt,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Compare the receipt image against this OCR invoice and category list:\n\n${input}`,
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${file.mimetype};base64,${fileBase64}`,
            },
          },
        ],
      },
    ];

    try {
      const result = await this.lisaChat({ model: selectedModel, messages }, request);
      const content = result.choices?.[0]?.message?.content;

      if (!content || typeof content !== 'string') {
        throw new InternalServerErrorException(
          'LISA returned empty or non-text response',
        );
      }

      return {
        ...parseLisaContent(content as string),
      };
    } catch (error: any) {
      console.log({
        promptLength: prompt.length,
        inputLength: input.length,
        fileSize: file.size,
        base64Length: fileBase64.length,
        ocrItems: compactOcr.items.length,
        categories: categories.length,
      });

      console.error('[LisaService.lisaAnalyzeBill] error:', {
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

  private async scanInvoiceWithOcr(file: Express.Multer.File) {
    const formData = new FormData();
    formData.append(
      'file',
      new Blob([new Uint8Array(file.buffer)]),
      file.originalname,
    );
    formData.set('include_tokens', 'false');

    try {
      const response = await fetch(
        process.env.INVOICE_OCR_URL?.trim() || 'http://localhost:8000/scan',
        {
          method: 'POST',
          body: formData,
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new HttpException(
          { message: data?.error || data?.message || 'OCR processing failed' },
          response.status,
        );
      }

      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      const message =
        error instanceof Error
          ? error.message
          : 'Failed to process OCR request';
      throw new HttpException({ message }, HttpStatus.BAD_GATEWAY);
    }
  }

  async lisaProcessInvoice(
    uploadedFile: Blob,
    model: string | undefined,
    prompt: string | undefined,
    expenseId?: string,
    request?: Request,
  ): Promise<AiProcessInvoiceResponse> {
    const user = request?.['user'] as { id: string } | undefined;

    if (!user?.id) {
      throw new BadRequestException('Authenticated user is required');
    }

    const analyzed = await this.lisaAnalyzeBill(
      uploadedFile,
      model,
      prompt,
      request,
      );
    const invoice = analyzed.invoice;

    if (!invoice?.merchant || !invoice.totalAmount) {
      throw new BadRequestException('Validated invoice is missing merchant or total amount');
    }

    let merchantId: string;
    let merchantName: string;
    let expense: any;
    const createdItems: ExpenseItem[] = [];

    if (expenseId) {
      const existingExpense = await this.expensesService.findOne(expenseId);
      
      if (!existingExpense) {
        throw new BadRequestException(`Expense with ID ${expenseId} not found`);
      }

      if (existingExpense.userId !== user.id) {
        throw new BadRequestException('Expense does not belong to authenticated user');
      }

      merchantId = existingExpense.merchantId!;
      
      if (invoice.merchant !== existingExpense.merchant?.name) {
        await this.merchantsService.update(merchantId, {
          name: invoice.merchant,
        });
      }
      merchantName = invoice.merchant;

      const updateData: any = {
        totalAmount: invoice.totalAmount,
        note: `Lisa validation: ${invoice.validationStatus}`,
      };
      
      if (invoice.date) {
        updateData.expenseDate = new Date(invoice.date);
      }

      await this.expensesService.update(expenseId, updateData);
      expense = {
        id: expenseId,
        totalAmount: invoice.totalAmount,
        createdAt: existingExpense.createdAt,
      };

      const existingItems = await this.expenseItemsService.findAll(expenseId);
      
      const lisaItemsMap = new Map<string, typeof invoice.items[number]>();
      for (const item of invoice.items ?? []) {
        if (item.name) {
          lisaItemsMap.set(item.name.toLowerCase().trim(), item);
        }
      }

      const itemsToDelete = existingItems.filter(
        (existingItem) => !lisaItemsMap.has(existingItem.itemName.toLowerCase().trim())
      );

      for (const itemToDelete of itemsToDelete) {
        await this.expenseItemsService.delete(itemToDelete.id);
      }

      for (const item of invoice.items ?? []) {
        if (!item.name || item.totalPrice === null || item.totalPrice === undefined) {
          continue;
        }

        const existingItem = existingItems.find(
          (ei) => ei.itemName.toLowerCase().trim() === item.name!.toLowerCase().trim()
        );

        const quantity =
          item.quantity && Number.isInteger(item.quantity) && item.quantity > 0
            ? item.quantity
            : 1;
        const unitPrice =
          item.unitPrice && item.unitPrice > 0
            ? item.unitPrice
            : item.totalPrice / quantity;

        if (existingItem) {
          const needsUpdate =
            Math.abs(Number(existingItem.totalPrice) - item.totalPrice) > 0.01 ||
            Math.abs(Number(existingItem.unitPrice) - unitPrice) > 0.01 ||
            existingItem.quantity !== quantity;

          if (needsUpdate) {
            await this.expenseItemsService.update(existingItem.id, {
              itemName: item.name,
              quantity,
              unitPrice,
              totalPrice: item.totalPrice,
              categoryId: item.categoryId ?? undefined,
            });
          }

          createdItems.push(this.toExpenseItem({
            ...existingItem,
            quantity,
            unitPrice,
            totalPrice: item.totalPrice,
          }));
        } else {
          if (item.totalPrice <= 0) {
            continue;
          }

          const created = await this.expenseItemsService.create({
            expenseId: expenseId,
            itemName: item.name,
            quantity,
            unitPrice,
            totalPrice: item.totalPrice,
            categoryId: item.categoryId ?? undefined,
          });

          createdItems.push(this.toExpenseItem(created));
        }
      }
    } else {
      const merchant = await this.merchantsService.create({
        name: invoice.merchant,
      });

      expense = await this.expensesService.create({
        userId: user.id,
        merchantId: merchant.id,
        totalAmount: invoice.totalAmount,
        expenseDate: invoice.date ? new Date(invoice.date) : new Date(),
        note: `Lisa validation: ${invoice.validationStatus}`,
      });

      merchantId = merchant.id;
      merchantName = merchant.name;

      for (const item of invoice.items ?? []) {
        if (!item.name || !item.totalPrice || item.totalPrice <= 0) {
          continue;
        }

        const quantity =
          item.quantity && Number.isInteger(item.quantity) && item.quantity > 0
            ? item.quantity
            : 1;
        const unitPrice =
          item.unitPrice && item.unitPrice > 0
            ? item.unitPrice
            : item.totalPrice / quantity;

        const created = await this.expenseItemsService.create({
          expenseId: expense.id,
          itemName: item.name,
          quantity,
          unitPrice,
          totalPrice: item.totalPrice,
          categoryId: item.categoryId ?? undefined,
        });

        createdItems.push(this.toExpenseItem(created));
      }
    }

    return {
      invoice: {
        expenseId: expense.id,
        merchantId: merchantId,
        merchantName: merchantName,
        totalAmount: Number(expense.totalAmount),
        items: createdItems,
        createdAt: expense.createdAt.toISOString(),
        validationStatus: invoice.validationStatus,
      },
    };
  }

  private toExpenseItem(item: any): ExpenseItem {
    return {
      ...item,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
      createdAt: item.createdAt.toISOString(),
    };
  }
}
  
