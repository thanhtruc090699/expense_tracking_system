import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpCacheMiddleware } from './middleware/http-cache.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'If-None-Match'],
    exposedHeaders: ['ETag', 'Cache-Control', 'Last-Modified', 'X-Cache-Time'],
  });
  
  const cacheMiddleware = new HttpCacheMiddleware();
  app.use((req, res, next) => cacheMiddleware.use(req, res, next));
  
  await app.listen(process.env.PORT ?? 3000);

}
bootstrap();
