/**
 * Process Invoice Request DTO
 * Maps to /ocr/process-invoice POST request parameters
 */
export class ProcessInvoiceRequestDto {
  lang?: string = 'eng';
  psm?: number = 6;
  oem?: number = 1;
  min_conf?: number = 30;
  pdf_mode?: string = 'auto';
}
