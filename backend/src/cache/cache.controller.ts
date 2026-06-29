import { Controller, Get } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';

@Controller('cache')
export class CacheController {
  constructor(private readonly cacheService: CacheService) {}

  @Get('stats')
  getStats() {
    const stats = this.cacheService.getStats();
    return {
      ...stats,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('clear')
  async clear() {
    await this.cacheService.clear();
    return { message: 'Cache cleared successfully' };
  }
}
