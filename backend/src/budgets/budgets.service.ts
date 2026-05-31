import { Injectable, 
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
 } from '@nestjs/common';
import { prisma } from '../prisma';
import {
Budget, CreateBudgetDto,
DeleteBudget200Response,
PartiallyUpdateBudgetDto,
UpdateBudgetDto,
} from '../generated/models';

import { BudgetMapper} from './budgets.mapper';


@Injectable()
export class BudgetsService {
  async createBudget(dto: CreateBudgetDto, request: Request):Promise<Budget> {
    const user = request['user'] as { id: string } | undefined;

    console.log('REQUEST USER =', user);
    console.log('REQUEST USER ID =', user?.id);
    console.log('DTO USER ID =', dto.userId);

    if (!user?.id) {
      throw new UnauthorizedException('Authentification is required');
    }

    if(!dto.userId){
      throw new BadRequestException('userId is required');
    }

    if (dto.userId != user.id){
      throw new ForbiddenException('You can only create budgets for yourself');
    }
    if (dto.amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const rawEndDate = dto.endDate;

    const normalizedEndDate = rawEndDate?.replace(
      /^(\d{2})-(\d{2})-(\d{4})$/,
      '$3-$2-$1',
    );

    const endDate = normalizedEndDate ? new Date(normalizedEndDate) : null;


    if(dto.endDate && Number.isNaN(endDate!.getTime())){
      throw new BadRequestException('End date must be a valid date string');
    }

    if(endDate && endDate < new Date()){
      throw new BadRequestException('End date must be in the future');
    }


    if(dto.notifyThreshold !== undefined && dto.notifyThreshold < 0){
      throw new BadRequestException('Notify threshold must be greater than or equal to 0');
    }

    if(dto.notifyThreshold !== undefined && dto.notifyThreshold > dto.amount){
      throw new BadRequestException('Notify threshold cannot be greater than amount');
    }

    if(dto.categoryId){
      const category = await prisma.category.findUnique({
        where: { id: dto.categoryId},
      })
      if(!category){
        throw new BadRequestException('Category does not exist');
      }
    }

    const existingBudget = await prisma.budget.findFirst({
      where: {
        userId: dto.userId,
        categoryId: dto.categoryId || null,
      },
    });

    if (existingBudget){
      throw new ConflictException('Budget already exists for this category');
    }

    const createdBudget = await prisma.budget.create({
      data:{
        userId: dto.userId,
        categoryId: dto.categoryId || null,
        amount: dto.amount,
        notifyThreshold: dto.notifyThreshold,
        endDate: endDate,
      },
      include: { category:true,
      },
    });
    return BudgetMapper.toBudget(createdBudget);

  }


  async findAllBudgets(userId?: string, request?: Request): Promise<Budget[]> {

    const user = request?.['user'] as { id: string } | undefined;

    if(!user?.id){
      throw new UnauthorizedException('Authentication is required');
    }
    if (userId && userId !== user.id){
      throw new ForbiddenException('You can only access your own budgets');
    }

    const budgets = await prisma.budget.findMany({
      where:{
        userId: user.id,
      },
      include:{
        category: true,
      },
      orderBy:{
        createdAt: 'desc',
      },
    });
    return budgets.map((budget) => BudgetMapper.toBudget(budget));
    
  }

  async findOneBudget(id: string, request?: Request): Promise<Budget> {
    const user = request?.['user'] as { id: string } | undefined;

    if(!user?.id){
      throw new UnauthorizedException('Authentication is required');
    }
   
    const budget = await prisma.budget.findUnique({
      where: { id: id,
        userId: user.id,
       },
      include: { category: true },
    });
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }
    return BudgetMapper.toBudget(budget);
  }

  async updateBudget(
    id: string, updateBudgetDto: UpdateBudgetDto, request?: Request
  ): Promise<Budget> {
    const user = request?.['user'] as { id: string } | undefined;

    if(!user?.id){
      throw new UnauthorizedException('Authentication is required');
    }

    const requiredFields = ['amount', 'notifyThreshold', 'endDate', 'categoryId'];

    const missingFields = requiredFields.filter(
      (field) => 
        updateBudgetDto[field] === undefined || updateBudgetDto[field] === null,
    );
    
    if (missingFields.length > 0) {
      throw new BadRequestException(`Missing required fields: ${missingFields.join(', ')}`);
    }


    const existingBudget = await prisma.budget.findUnique({
      where: { id: id,
        userId: user.id,
       },
      include: { category: true 
       },
    });

    if (!existingBudget) {
      throw new NotFoundException('Budget not found');
    }

    if(user.id !== existingBudget.userId){
      throw new ForbiddenException('You can only update your own budgets');
    }

    if (updateBudgetDto.amount !== undefined && updateBudgetDto.amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    let endDate: Date | null = null;
    if (updateBudgetDto.endDate !== undefined) {
      endDate = new Date(updateBudgetDto.endDate);
      if (Number.isNaN(endDate.getTime())) {
        throw new BadRequestException('End date must be a valid date string');
      }
    }

    if(endDate && endDate < new Date()){
      throw new BadRequestException('End date must be in the future');
    }

    if(updateBudgetDto.notifyThreshold !== undefined && updateBudgetDto.notifyThreshold < 0){
      throw new BadRequestException('Notify threshold must be greater than or equal to 0');
    }

    if (updateBudgetDto.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: updateBudgetDto.categoryId },
      });
      if (!category) {
        throw new BadRequestException('Category does not exist');
      }
    }

    const updatedBudget = await prisma.budget.update({
      where: { id: id,
        userId: user.id,
       },
      data: {
        amount: updateBudgetDto.amount,
        notifyThreshold: updateBudgetDto.notifyThreshold,
        endDate: endDate,
        categoryId: updateBudgetDto.categoryId,
      },
      include: { category: true },
    });

    return BudgetMapper.toBudget(updatedBudget);
  }

  async partiallyUpdateBudget(id: string, partiallyUpdateBudgetDto: PartiallyUpdateBudgetDto, request?: Request): Promise<Budget> {
    const user = request?.['user'] as { id: string } | undefined;

    if(!user?.id){
      throw new UnauthorizedException('Authentication is required');
    }

    const existingBudget = await prisma.budget.findFirst({
      where: { id: id,
        userId: user.id,
       },
      include: { category: true },
    });

    if (!existingBudget) {
      throw new NotFoundException('Budget not found');
    }

    if(user.id !== existingBudget.userId){
      throw new ForbiddenException('You can only update your own budgets');
    }

    if (partiallyUpdateBudgetDto.amount !== undefined && partiallyUpdateBudgetDto.amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    let endDate: Date | null = null;
    if (partiallyUpdateBudgetDto.endDate !== undefined) {
      endDate = new Date(partiallyUpdateBudgetDto.endDate);
      if (Number.isNaN(endDate.getTime())) {
        throw new BadRequestException('End date must be a valid date string');
      }
    }

    if(endDate && endDate < new Date()){
      throw new BadRequestException('End date must be in the future');
    }
    
    if (partiallyUpdateBudgetDto.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: partiallyUpdateBudgetDto.categoryId },
      });
      if (!category) {
        throw new BadRequestException('Category does not exist');
      }
    }

    const updatedBudget = await prisma.budget.update({
      where: { id: id,
        userId: user.id,
       },
      data: {
        ...(partiallyUpdateBudgetDto.amount !== undefined && {
          amount: partiallyUpdateBudgetDto.amount,
        }),
        ...(partiallyUpdateBudgetDto.notifyThreshold !== undefined && {
          notifyThreshold: partiallyUpdateBudgetDto.notifyThreshold,
        }),
        ...(partiallyUpdateBudgetDto.endDate !== undefined && {
          endDate: endDate,
        }),
        ...(partiallyUpdateBudgetDto.categoryId !== undefined && {
          categoryId: partiallyUpdateBudgetDto.categoryId,
        }),
      },
      include: { category: true },
    });

    return BudgetMapper.toBudget(updatedBudget);
  }

  async deleteBudget(id: string, request?: Request) {
    const user = request?.['user'] as { id: string } | undefined;

    if(!user?.id){
      throw new UnauthorizedException('Authentication is required');
    }

    const existingBudget = await prisma.budget.findUnique({
      where: { id: id,
        userId: user.id,
      },
    });

    if(user.id !== existingBudget?.userId){
      throw new ForbiddenException('You can only delete your own budgets');
    }

    if (!existingBudget) {
      throw new NotFoundException('Budget not found');
    }

    return prisma.budget.delete({ where: { id } });
  }
}
