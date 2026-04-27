import { Injectable } from '@nestjs/common';
import type { Category, CreateCategoryDto, UpdateCategoryDto, DeleteCategory200Response } from '../generated/models';
import { CategoriesApi } from '../generated/api/CategoriesApi';
import { CategoriesService } from './categories.service';

@Injectable()
export class CategoriesApiImpl extends CategoriesApi {
  constructor(private readonly categoriesService: CategoriesService) {
    super();
  }

  async createCategory(createCategoryDto: CreateCategoryDto, request: Request): Promise<Category> {
    const category = await this.categoriesService.create(createCategoryDto);
    return this.toCategory(category);
  }

  async findAllCategories(request: Request): Promise<Category[]> {
    const categories = await this.categoriesService.findAll();
    return categories.map((c) => this.toCategory(c));
  }

  async findOneCategory(id: string): Promise<Category> {
    const category = await this.categoriesService.findOne(id);
    return this.toCategory(category);
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.categoriesService.update(id, updateCategoryDto);
    return this.toCategory(category);
  }

  async deleteCategory(id: string): Promise<DeleteCategory200Response> {
    await this.categoriesService.delete(id);
    return { message: 'Category deleted successfully' };
  }

  private toCategory(category: any): Category {
    return {
      ...category,
      createdAt: category.createdAt.toISOString(),
    };
  }
}
