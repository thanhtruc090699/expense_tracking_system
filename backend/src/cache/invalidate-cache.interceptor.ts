import {
  Injectable,
  Logger,
  ExecutionContext,
  CallHandler,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { CacheService } from './cache.service';
import { Reflector } from '@nestjs/core';
import {
  INVALIDATE_CACHE_TAGS_METADATA,
  INVALIDATE_CACHE_KEYS_METADATA,
  INVALIDATE_AUTO_MONTH_METADATA,
} from './invalidate-cache.decorator';

@Injectable()
export class InvalidateCacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(InvalidateCacheInterceptor.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const tags =
      this.reflector.get<string[]>(
        INVALIDATE_CACHE_TAGS_METADATA,
        context.getHandler(),
      ) || [];
    const keys =
      this.reflector.get<string[]>(
        INVALIDATE_CACHE_KEYS_METADATA,
        context.getHandler(),
      ) || [];
    const autoMonthField = this.reflector.get<string>(
      INVALIDATE_AUTO_MONTH_METADATA,
      context.getHandler(),
    );

    return next.handle().pipe(
      tap(async (result) => {
        if (result && (tags.length > 0 || keys.length > 0)) {
          const request = context.switchToHttp().getRequest();
          const user = request['user'];
          
          let resolvedTags = [...tags];
          
          if (autoMonthField && result[autoMonthField]) {
            const date = new Date(result[autoMonthField]);
            const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            resolvedTags = resolvedTags.map(tag => 
              tag.replace('{auto}', monthStr).replace('{userId}', user?.id || 'anonymous')
            );
          } else {
            resolvedTags = resolvedTags.map(tag => 
              tag.replace('{userId}', user?.id || 'anonymous')
            );
          }

          const invalidatedTags = await this.cacheService.invalidateByTags(resolvedTags);
          const invalidatedKeys = await Promise.all(
            keys.map(key => this.cacheService.delete(this.resolveKey(key, request)))
          );

          this.logger.debug(
            `Invalidated ${invalidatedTags} cache entries via tags and ${invalidatedKeys.length} via keys`,
          );
        }
      }),
    );
  }

  private resolveKey(template: string, request: any): string {
    const params = { ...request.params, ...request.query };
    const user = request['user'];
    
    if (user?.id) {
      params.userId = user.id;
    }

    let key = template;
    key = key.replace(/{userId}/g, params.userId || 'anonymous');
    key = key.replace(/{id}/g, params.id || '');
    key = key.replace(/{expenseId}/g, params.expenseId || '');
    
    return key;
  }
}
