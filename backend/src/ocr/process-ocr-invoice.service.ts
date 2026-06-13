import { Injectable, BadRequestException } from '@nestjs/common';
import { MerchantsService } from '../merchants/merchants.service';
import { ExpensesService } from '../expenses/expenses.service';
import { ExpenseItemsService } from '../expense-items/expense-items.service';
import type { ProcessedInvoice, ScanResponse } from '../generated/models';

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
   * @returns ProcessedInvoice with created expense and merchant info
   * @throws BadRequestException if OCR response structure is invalid
   */
  async processInvoice(
    ocrData: ScanResponse,
    userId: string,
  ): Promise<ProcessedInvoice> {
    // Validate OCR response structure
    this.validateOcrData(ocrData);

    const invoice = ocrData.data.invoice;

    const merchant = await this.merchantsService.create({
      name: invoice.vendor || '',
    });

    const totalAmount = invoice.totals?.total_amount || 0;
    const itemsCount = Array.isArray(invoice.items) ? invoice.items.length : 0;

    const expense = await this.expensesService.create({
      userId,
      merchantId: merchant.id,
      totalAmount,
      expenseDate: new Date(),
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
            categoryId: null,
          });
          itemsCreated++;
        } catch (error) {
          console.error(
            `[ProcessOcrInvoiceService] Failed to create expense item: ${item.item_name}`,
            error,
          );
        }
      }
    }

    return {
      expenseId: expense.id,
      merchantId: merchant.id,
      merchantName: merchant.name,
      totalAmount: totalAmount,
      itemsCount: itemsCreated,
      createdAt: (expense.createdAt || new Date()).toISOString(),
    };
  }

  /**
   * @throws BadRequestException if core response structure is invalid
   */
  private validateOcrData(ocrData: ScanResponse): void {
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
