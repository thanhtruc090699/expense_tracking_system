import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { prisma } from '../prisma';

@Injectable()
export class CategoriesService {
  async create(data: { name: string; icon?: string }) {
    try {
      return await prisma.category.create({ data });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Category with this name already exists');
      }
      throw error;
    }
  }

  async findAll() {
    return prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async findByName(name: string) {
    return prisma.category.findFirst({ where: { name } });
  }

  async update(id: string, data: { name?: string; icon?: string }) {
    await this.findOne(id);
    try {
      return await prisma.category.update({ where: { id }, data });
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
      return await prisma.category.delete({ where: { id } });
    } catch (error: any) {
      if (error.code === 'P2003') {
        throw new ConflictException('Category is still referenced by expenses, expense items, or budgets');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Category not found');
      }
      throw error;
    }
  }
}
