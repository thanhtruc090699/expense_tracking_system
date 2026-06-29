import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { prisma } from '../prisma';
import { CacheService } from '../cache/cache.service';
import { TTL_CONFIG } from '../cache/cache.strategy';

@Injectable()
export class CategoriesService {
  constructor(private readonly cacheService: CacheService) {}

  async create(data: { name: string; icon?: string }) {
    try {
      const result = await prisma.category.create({ data });
      await this.cacheService.invalidateByTag('tag:categories:list');
      return result;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Category with this name already exists');
      }
      throw error;
    }
  }

  async findAll() {
    const cached = await this.cacheService.get<any[]>('categories:list');
    if (cached) {
      return cached;
    }

    const result = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    await this.cacheService.set(
      'categories:list',
      result,
      TTL_CONFIG.CATEGORIES_LIST,
      ['tag:categories:list'],
    );
    return result;
  }

  async findOne(id: string) {
    const cacheKey = `categories:id:${id}`;
    const cached = await this.cacheService.get<any>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    
    await this.cacheService.set(
      cacheKey,
      category,
      TTL_CONFIG.CATEGORIES_ID,
      ['tag:categories:id:' + id],
    );
    return category;
  }

  async findByName(name: string) {
    return prisma.category.findFirst({ where: { name } });
  }

  async update(id: string, data: { name?: string; icon?: string }) {
    await this.findOne(id);
    try {
      const result = await prisma.category.update({ where: { id }, data });
      await this.cacheService.invalidateByTag('tag:categories:list');
      await this.cacheService.delete(`categories:id:${id}`);
      return result;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Category not found');
      }
      throw error;
    }
  }

  async delete(id: string) {
    await this.findOne(id);
    try {
      const result = await prisma.category.delete({ where: { id } });
      await this.cacheService.invalidateByTag('tag:categories:list');
      await this.cacheService.delete(`categories:id:${id}`);
      return result;
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new ConflictException(
          'Category is still referenced by expenses, expense items, or budgets',
        );
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Category not found');
      }
      throw error;
    }
  }
}
