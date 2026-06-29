import { Module, Global } from '@nestjs/common';
import { CacheService } from './cache.service';
import { CacheController } from './cache.controller';

@Global()
@Module({
  providers: [CacheService],
  exports: [CacheService],
  controllers: [CacheController],
})
export class CacheModule {}
