import { Injectable, Logger } from '@nestjs/common';
import { CacheEntry } from './interfaces/cache-options.interface';

@Injectable()
export class CacheService {
  private readonly cache = new Map<string, CacheEntry>();
  private readonly tagIndex = new Map<string, Set<string>>();
  private readonly logger = new Logger(CacheService.name);

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.logger.debug(`Cache MISS: ${key}`);
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.logger.debug(`Cache EXPIRED: ${key}`);
      await this.delete(key);
      return null;
    }

    this.logger.debug(`Cache HIT: ${key}`);
    return entry.value as T;
  }

  async set(
    key: string,
    value: any,
    ttl: number,
    tags: string[] = [],
    hash?: string,
  ): Promise<void> {
    const entry: CacheEntry = {
      value,
      expiresAt: Date.now() + ttl,
      tags,
      hash,
      createdAt: Date.now(),
    };

    this.cache.set(key, entry);

    for (const tag of tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    }

    this.logger.debug(`Cache SET: ${key} (TTL: ${ttl}ms, Tags: ${tags.join(', ')})`);
  }

  async delete(key: string): Promise<void> {
    const entry = this.cache.get(key);
    
    if (entry) {
      for (const tag of entry.tags) {
        const keys = this.tagIndex.get(tag);
        if (keys) {
          keys.delete(key);
          if (keys.size === 0) {
            this.tagIndex.delete(tag);
          }
        }
      }
      this.cache.delete(key);
      this.logger.debug(`Cache DELETE: ${key}`);
    }
  }

  async invalidateByTag(tag: string): Promise<number> {
    const keys = this.tagIndex.get(tag);
    
    if (!keys || keys.size === 0) {
      this.logger.debug(`Invalidation by tag '${tag}': No keys found`);
      return 0;
    }

    const count = keys.size;
    const keysToDelete = Array.from(keys);
    
    for (const key of keysToDelete) {
      await this.delete(key);
    }

    this.logger.log(`Invalidated ${count} cache entries for tag: ${tag}`);
    return count;
  }

  async invalidateByTags(tags: string[]): Promise<number> {
    let totalInvalidated = 0;
    
    for (const tag of tags) {
      totalInvalidated += await this.invalidateByTag(tag);
    }

    return totalInvalidated;
  }

  async invalidateByKeyPattern(pattern: string): Promise<number> {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (this.matchesPattern(key, pattern)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      await this.delete(key);
    }

    this.logger.log(`Invalidated ${keysToDelete.length} cache entries matching pattern: ${pattern}`);
    return keysToDelete.length;
  }

  private matchesPattern(key: string, pattern: string): boolean {
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/{[^}]+}/g, '[^/]+');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(key);
  }

  getStats(): { size: number; tags: number } {
    return {
      size: this.cache.size,
      tags: this.tagIndex.size,
    };
  }

  async clear(): Promise<void> {
    const size = this.cache.size;
    this.cache.clear();
    this.tagIndex.clear();
    this.logger.log(`Cache cleared: ${size} entries removed`);
  }
}
