import { PrismaClient } from '@prisma/client';
import { prismaConfig } from '../prisma.config';

const prisma = new PrismaClient({
  adapter: prismaConfig.adapter,
});

export { prisma };
