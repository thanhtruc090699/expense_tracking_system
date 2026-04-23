import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import type { Bill, CreateBillDto, UpdateBillDto } from '../generated/models';

@Injectable()
export class BillsService {
  async create(data: CreateBillDto): Promise<Bill> {
    const prismaData = this.toPrismaCreateInput(data);
    const bill = await prisma.bill.create({ data: prismaData });
    return this.toBill(bill);
  }

  async findAll(userId?: string): Promise<Bill[]> {
    const bills = await prisma.bill.findMany({
      where: userId ? { userId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return bills.map((b) => this.toBill(b));
  }

  async findOne(id: string): Promise<Bill> {
    const bill = await prisma.bill.findUnique({ where: { id } });
    if (!bill) throw new NotFoundException('Bill not found');
    return this.toBill(bill);
  }

  async update(id: string, data: UpdateBillDto): Promise<Bill> {
    await this.findOne(id);
    const prismaData = this.toPrismaUpdateInput(data);
    const bill = await prisma.bill.update({ where: { id }, data: prismaData });
    return this.toBill(bill);
  }

  async delete(id: string): Promise<void> {
    await this.findOne(id);
    await prisma.bill.delete({ where: { id } });
  }

  private toPrismaCreateInput(data: CreateBillDto): Prisma.BillUncheckedCreateInput {
    return {
      fileUrl: data.fileUrl,
      fileType: data.fileType,
      ocrData: data.ocrData as Prisma.InputJsonValue,
      userId: data.userId,
    };
  }

  private toPrismaUpdateInput(data: UpdateBillDto): Prisma.BillUncheckedUpdateInput {
    const result: Prisma.BillUncheckedUpdateInput = {};
    if (data.fileUrl !== undefined) result.fileUrl = data.fileUrl;
    if (data.fileType !== undefined) result.fileType = data.fileType;
    if (data.ocrData !== undefined) result.ocrData = data.ocrData as Prisma.InputJsonValue;
    if (data.isDuplicate !== undefined) result.isDuplicate = data.isDuplicate;
    return result;
  }

  private toBill(dbBill: {
    id: string;
    fileUrl: string;
    fileType: string;
    ocrData: unknown;
    isDuplicate: boolean;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }): Bill {
    return {
      id: dbBill.id,
      fileUrl: dbBill.fileUrl,
      fileType: dbBill.fileType,
      ocrData: dbBill.ocrData as object | null,
      isDuplicate: dbBill.isDuplicate,
      userId: dbBill.userId,
      createdAt: dbBill.createdAt.toISOString(),
      updatedAt: dbBill.updatedAt.toISOString(),
    };
  }
}
