import { Controller, Get } from '@nestjs/common';
import { OcrService } from './ocr.service';

@Controller('ocr')
export class OcrController {
	constructor(private readonly ocrService: OcrService) {}

	@Get()
	async fetchOcr() {
		return this.ocrService.fetchOcr();
	}
}
