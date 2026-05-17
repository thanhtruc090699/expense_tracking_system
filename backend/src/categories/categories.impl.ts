import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  DeleteCategory200Response,
} from '../generated/models';
import { CategoriesApi } from '../generated/api/CategoriesApi';
import { CategoriesService } from './categories.service';

@Injectable()
export class CategoriesApiImpl extends CategoriesApi {
  constructor(private readonly categoriesService: CategoriesService) {
    super();
  }

  async createCategory(
    createCategoryDto: CreateCategoryDto,
    request: Request,
  ): Promise<Category> {
    if (!createCategoryDto.name) {
      throw new BadRequestException('Missing required field: name');
    }

    try {
      const existing = await this.categoriesService.findByName(createCategoryDto.name);
      if (existing) {
        throw new ConflictException('Category with this name already exists');
      }

      const category = await this.categoriesService.create(createCategoryDto);
      return this.toCategory(category);
    } catch (error: any) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException('Invalid category data');
    }
  }

  async findAllCategories(request: Request): Promise<Category[]> {
    const categories = await this.categoriesService.findAll();
    return categories.map((c) => this.toCategory(c));
  }

  async findOneCategory(id: string): Promise<Category> {
    if (!this.isValidUuid(id)) {
      throw new BadRequestException('Invalid category ID format');
    }

    try {
      const category = await this.categoriesService.findOne(id);
      return this.toCategory(category);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Invalid category ID');
    }
  }

  async updateCategory(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    if (!this.isValidUuid(id)) {
      throw new BadRequestException('Invalid category ID format');
    }

    try {
      if (updateCategoryDto.name) {
        const existing = await this.categoriesService.findByName(updateCategoryDto.name);
        if (existing && existing.id !== id) {
          throw new ConflictException('Category with this name already exists');
        }
      }

      const category = await this.categoriesService.update(id, updateCategoryDto);
      return this.toCategory(category);
    } catch (error: any) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new BadRequestException('Invalid category data');
    }
  }

  async deleteCategory(id: string): Promise<DeleteCategory200Response> {
    if (!this.isValidUuid(id)) {
      throw new BadRequestException('Invalid category ID format');
    }

    try {
      await this.categoriesService.delete(id);
      return { message: 'Category deleted successfully' };
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new ConflictException('Category is still used by expenses, expense items, or budgets');
      }
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to delete category');
    }
  }

  private isValidUuid(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  private toCategory(category: any): Category {
    return {
      ...category,
      createdAt: category.createdAt.toISOString(),
    };
  }
}
