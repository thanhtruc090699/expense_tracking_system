/**
 * Processed Invoice Response DTO
 * Maps to /ocr/process-invoice POST response (ProcessedInvoice schema from spec)
 */
export class ProcessedInvoiceDto {
  /**
   * Created expense ID
   */
  expenseId: string;

  /**
   * Merchant ID
   */
  merchantId: string;

  /**
   * Merchant name
   */
  merchantName: string;

  /**
   * Total expense amount
   */
  totalAmount: number;

  /**
   * Number of expense items created
   */
  itemsCount: number;

  /**
   * Expense creation timestamp
   */
  createdAt: Date;

  constructor(
    expenseId: string,
    merchantId: string,
    merchantName: string,
    totalAmount: number,
    itemsCount: number,
    createdAt: Date,
  ) {
    this.expenseId = expenseId;
    this.merchantId = merchantId;
    this.merchantName = merchantName;
    this.totalAmount = totalAmount;
    this.itemsCount = itemsCount;
    this.createdAt = createdAt;
  }
}
