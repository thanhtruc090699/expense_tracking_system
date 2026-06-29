import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { prisma } from '../prisma';
import { CacheService } from '../cache/cache.service';
import { TTL_CONFIG } from '../cache/cache.strategy';

@Injectable()
export class MerchantsService {
  constructor(private readonly cacheService: CacheService) {}

  async create(data: { name: string; business?: string }) {
    const sanitizedName = (data.name || '').trim() || 'Unknown Merchant';

    const existing = await prisma.merchant.findFirst({
      where: {
        name: {
          equals: sanitizedName,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      return existing;
    }

    try {
      const result = await prisma.merchant.create({
        data: {
          name: sanitizedName,
          business: data.business,
        },
      });
      await this.cacheService.invalidateByTag('tag:merchants:list');
      return result;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Merchant with this name already exists');
      }
      throw error;
    }
  }

  async findAll() {
    const cached = await this.cacheService.get<any[]>('merchants:list');
    if (cached) {
      return cached;
    }

    try {
      const result = await prisma.merchant.findMany({ orderBy: { name: 'asc' } });
      await this.cacheService.set(
        'merchants:list',
        result,
        TTL_CONFIG.MERCHANTS_LIST,
        ['tag:merchants:list'],
      );
      return result;
    } catch (error: any) {
      throw new BadRequestException('Failed to retrieve merchants');
    }
  }

  async search(name: string) {
    const cacheKey = `merchants:search:${name.toLowerCase().replace(/\s+/g, '-')}`;
    const cached = await this.cacheService.get<any[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await prisma.merchant.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
      orderBy: { name: 'asc' },
    });
    
    await this.cacheService.set(
      cacheKey,
      result,
      TTL_CONFIG.MERCHANTS_SEARCH,
      ['tag:merchants:search'],
    );
    return result;
  }

  async findOne(id: string) {
    const cacheKey = `merchants:id:${id}`;
    const cached = await this.cacheService.get<any>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const merchant = await prisma.merchant.findUnique({ where: { id } });
    if (!merchant) throw new NotFoundException('Merchant not found');
    
    await this.cacheService.set(
      cacheKey,
      merchant,
      TTL_CONFIG.MERCHANTS_ID,
      ['tag:merchants:id:' + id],
    );
    return merchant;
  }

  async update(id: string, data: { name?: string; business?: string }) {
    await this.findOne(id);
    const result = await prisma.merchant.update({ where: { id }, data });
    await this.cacheService.invalidateByTag('tag:merchants:list');
    await this.cacheService.delete(`merchants:id:${id}`);
    return result;
  }
}
