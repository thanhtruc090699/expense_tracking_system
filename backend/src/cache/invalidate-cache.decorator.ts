import { SetMetadata } from '@nestjs/common';
import { InvalidateCacheOptions } from './interfaces/cache-options.interface';

export const INVALIDATE_CACHE_TAGS_METADATA = '__invalidate_cache_tags__';
export const INVALIDATE_CACHE_KEYS_METADATA = '__invalidate_cache_keys__';
export const INVALIDATE_AUTO_MONTH_METADATA = '__invalidate_auto_month__';

export const InvalidateCache = (options: InvalidateCacheOptions) =>
  SetMetadata(INVALIDATE_CACHE_TAGS_METADATA, options.tags || [])
    ? SetMetadata(INVALIDATE_CACHE_KEYS_METADATA, options.keys || [])
    : SetMetadata(INVALIDATE_AUTO_MONTH_METADATA, options.autoMonthFromData);
