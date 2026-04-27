import { Inject, Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import type { Observable } from 'rxjs';
import type { Category, CreateCategoryDto, DeleteCategory200Response, UpdateCategoryDto } from '../generated/models';
import { CategoriesApi } from '../generated/api/CategoriesApi';
import { CATEGORIES_API_PROVIDER } from './categories.constants';
import { JwtGuard } from '../auth/jwt/jwt.guard';

@Controller('categories')
@UseGuards(JwtGuard)
export class CategoriesController {
  constructor(@Inject(CATEGORIES_API_PROVIDER) private readonly categoriesApi: CategoriesApi) {}

  @Post()
  createCategory(@Body() createCategoryDto: CreateCategoryDto, @Req() request: Request): ReturnType<CategoriesApi['createCategory']> {
    return this.categoriesApi.createCategory(createCategoryDto, request);
  }

  @Get()
  findAllCategories(@Req() request: Request): ReturnType<CategoriesApi['findAllCategories']> {
    return this.categoriesApi.findAllCategories(request);
  }

  @Get(':id')
  findOneCategory(@Param('id') id: string, @Req() request: Request): ReturnType<CategoriesApi['findOneCategory']> {
    return this.categoriesApi.findOneCategory(id, request);
  }

  @Put(':id')
  updateCategory(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto, @Req() request: Request): ReturnType<CategoriesApi['updateCategory']> {
    return this.categoriesApi.updateCategory(id, updateCategoryDto, request);
  }

  @Delete(':id')
  deleteCategory(@Param('id') id: string, @Req() request: Request): ReturnType<CategoriesApi['deleteCategory']> {
    return this.categoriesApi.deleteCategory(id, request);
  }
}
