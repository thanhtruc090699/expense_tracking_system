export interface CacheOptions {
  key: string;
  ttl?: number;
  tags?: string[];
  conditional?: boolean;
}

export interface InvalidateCacheOptions {
  tags?: string[];
  keys?: string[];
  autoMonthFromData?: string;
}

export interface CacheEntry {
  value: any;
  expiresAt: number;
  tags: string[];
  hash?: string;
  createdAt: number;
}

export interface CacheKeyBuilder {
  build(params: Record<string, any>): string;
}
