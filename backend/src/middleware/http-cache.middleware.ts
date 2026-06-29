import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';

@Injectable()
export class HttpCacheMiddleware implements NestMiddleware {
  private readonly logger = new Logger(HttpCacheMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    if (req.method !== 'GET') {
      next();
      return;
    }

    const maxAge = this.getCacheMaxAge(req.path);
    
    if (maxAge > 0) {
      res.set('Cache-Control', `public, max-age=${maxAge}`);
    }

    const originalJson = res.json.bind(res);
    res.json = (data: any) => {
      if (!res.hasHeader('ETag')) {
        const content = JSON.stringify(data);
        const etag = '"' + createHash('md5').update(content).digest('hex') + '"';
        res.set('ETag', etag);
        res.set('X-Cache-Time', new Date().toISOString());
        
        const ifNoneMatch = req.headers['if-none-match'];
        if (ifNoneMatch && ifNoneMatch === etag) {
          return res.status(304).send();
        }

        const lastModified = new Date();
        res.set('Last-Modified', lastModified.toUTCString());
      }
      
      return originalJson(data);
    };

    next();
  }

  private getCacheMaxAge(path: string): number {
    if (path.includes('/categories')) {
      return 600;
    }
    
    if (path.includes('/merchants')) {
      return 300;
    }
    
    if (path.includes('/expenses/summary') || path.includes('/spendingSummary')) {
      return 300;
    }
    
    if (path.includes('/budgets')) {
      return 600;
    }
    
    if (path.includes('/expenses')) {
      return 120;
    }
    
    return 0;
  }
}
