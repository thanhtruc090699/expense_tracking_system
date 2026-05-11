import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../prisma';

@Injectable()
export class CategoriesService {
  async create(data: { name: string; icon?: string }) {
    return prisma.category.create({ data });
  }

  async findAll() {
    return prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, data: { name?: string; icon?: string }) {
    await this.findOne(id);
    return prisma.category.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findOne(id);
    return prisma.category.delete({ where: { id } });
  }
}
