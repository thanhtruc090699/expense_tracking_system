import { Injectable, BadRequestException } from '@nestjs/common';
import { MerchantsService } from '../merchants/merchants.service';
import { ExpensesService } from '../expenses/expenses.service';
import { ExpenseItemsService } from '../expense-items/expense-items.service';
import { ProcessedInvoiceDto } from './dto/processed-invoice.dto';

export interface OcrInvoiceData {
  ok: boolean;
  data: {
    meta: Record<string, any>;
    spatial: Record<string, any>;
    invoice: {
      vendor?: string;
      items: Array<{
        item_name: string;
        quantity?: number | null;
        amount_before_tax?: number | null;
        tax_percent?: number | null;
        final_amount: number;
        row_id?: number;
        row_bbox?: Record<string, any>;
      }>;
      tax_lines?: Array<Record<string, any>>;
      totals: {
        total_amount: number;
        total_items_declared?: number | null;
        line_items_sum?: number;
        sum_difference?: number;
        line_sum_matches_total?: boolean;
        total_items_detected?: number;
      };
    };
  };
}

@Injectable()
export class ProcessOcrInvoiceService {
  constructor(
    private merchantsService: MerchantsService,
    private expensesService: ExpensesService,
    private expenseItemsService: ExpenseItemsService,
  ) {}

  /**
   * @param ocrData - OCR response data from external OCR service
   * @param userId - User ID from JWT token
   * @returns ProcessedInvoiceDto with created expense and merchant info
   * @throws BadRequestException if OCR response structure is invalid
   */
  async processInvoice(
    ocrData: OcrInvoiceData,
    userId: string,
  ): Promise<ProcessedInvoiceDto> {
    // Validate OCR response structure
    this.validateOcrData(ocrData);

    const invoice = ocrData.data.invoice;

    const merchant = await this.merchantsService.create({
      name: invoice.vendor || '',
    });

    const totalAmount = invoice.totals?.total_amount ?? null;
    const itemsCount = Array.isArray(invoice.items) ? invoice.items.length : 0;

    const expense = await this.expensesService.create({
      userId,
      merchantId: merchant.id,
      totalAmount,
      expenseDate: new Date(),
      note: `OCR Receipt - ${itemsCount} items detected`,
    });

    let itemsCreated = 0;
    if (Array.isArray(invoice.items) && invoice.items.length > 0) {
      for (const item of invoice.items) {
        try {
          await this.expenseItemsService.create({
            expenseId: expense.id,
            itemName: item.item_name || 'Unknown Item',
            quantity: item.quantity || 1,
            unitPrice: item.amount_before_tax || item.final_amount || 0,
            totalPrice: item.final_amount || 0,
            categoryId: null, // Categories will be assigned later via AI VLM
          });
          itemsCreated++;
        } catch (error) {
          // Log but continue processing other items
          console.error(
            `[ProcessOcrInvoiceService] Failed to create expense item: ${item.item_name}`,
            error,
          );
        }
      }
    }

    return new ProcessedInvoiceDto(
      expense.id,
      merchant.id,
      merchant.name,
      totalAmount,
      itemsCreated,
      expense.createdAt || new Date(),
    );
  }

  /**
   * @throws BadRequestException if core response structure is invalid
   */
  private validateOcrData(ocrData: OcrInvoiceData): void {
    if (!ocrData || !ocrData.ok) {
      throw new BadRequestException('Invalid OCR response: ok flag not set');
    }

    if (!ocrData.data?.invoice) {
      throw new BadRequestException(
        'Invalid OCR response: missing invoice data',
      );
    }
  }
}
