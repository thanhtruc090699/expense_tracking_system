import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CategoriesApiImpl } from './categories.impl';
import { CATEGORIES_API_PROVIDER } from './categories.constants';

@Module({
  imports: [JwtModule],
  controllers: [CategoriesController],
  providers: [
    CategoriesService,
    {
      provide: CATEGORIES_API_PROVIDER,
      useClass: CategoriesApiImpl,
    },
  ],
  exports: [CATEGORIES_API_PROVIDER],
})
export class CategoriesModule {}
