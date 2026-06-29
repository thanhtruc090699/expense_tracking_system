import { SetMetadata, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { CacheService } from './cache.service';
import { TTL_CONFIG } from './cache.strategy';

export const CACHEABLE_KEY_METADATA = '__cacheable_key__';
export const CACHEABLE_TTL_METADATA = '__cacheable_ttl__';
export const CACHEABLE_TAGS_METADATA = '__cacheable_tags__';
export const CACHEABLE_CONDITIONAL_METADATA = '__cacheable_conditional__';

export interface CacheableOptions {
  key: string;
  ttl?: number;
  tags?: string[];
  conditional?: boolean;
}

export const Cacheable = (options: CacheableOptions) => {
  return SetMetadata(CACHEABLE_KEY_METADATA, options.key)
    && SetMetadata(CACHEABLE_TTL_METADATA, options.ttl ?? TTL_CONFIG.USER_SUMMARY)
    && SetMetadata(CACHEABLE_TAGS_METADATA, options.tags ?? [])
    && SetMetadata(CACHEABLE_CONDITIONAL_METADATA, options.conditional ?? false);
};

export class CacheInterceptor {
  constructor(private readonly cacheService: CacheService, private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const key = this.reflector.get<string>(CACHEABLE_KEY_METADATA, context.getHandler());
    const ttl = this.reflector.get<number>(CACHEABLE_TTL_METADATA, context.getHandler());
    const tags = this.reflector.get<string[]>(CACHEABLE_TAGS_METADATA, context.getHandler()) || [];
    const conditional = this.reflector.get<boolean>(CACHEABLE_CONDITIONAL_METADATA, context.getHandler());

    if (!key) {
      return next.handle();
    }

    const resolvedKey = this.resolveKey(key, context);

    return next.handle().pipe(
      tap(async (result) => {
        if (result !== undefined && result !== null) {
          await this.cacheService.set(resolvedKey, result, ttl, tags);
        }
      }),
    );
  }

  private resolveKey(template: string, context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();
    const user = request['user'];
    const params = { ...request.params, ...request.query };
    
    if (user?.id) {
      params.userId = user.id;
    }

    let key = template;

    key = key.replace(/{userId}/g, params.userId || 'anonymous');
    
    key = key.replace(/{YYYY-MM}/g, () => {
      if (params.month) {
        const date = new Date(params.month);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    key = key.replace(/{id}/g, params.id || '');
    key = key.replace(/{expenseId}/g, params.expenseId || '');
    key = key.replace(/{month}/g, params.month || '');

    const autoMonthMatch = template.match(/{auto:(\w+)}/);
    if (autoMonthMatch && params[autoMonthMatch[1]]) {
      const date = new Date(params[autoMonthMatch[1]]);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      key = key.replace(/{auto:\w+}/, monthStr);
    }

    return key;
  }
}
