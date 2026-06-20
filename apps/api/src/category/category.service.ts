import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateCategoryDto) {
    const category = await this.prisma.category.create({ data: dto });
    return { success: true, data: category };
  }
  async findAll() {
    const categories = await this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
    return { success: true, data: categories };
  }
  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    return { success: true, data: category };
  }
  async remove(id: string) {
    await this.prisma.category.delete({ where: { id } });
    return { success: true, message: 'Category deleted' };
  }
}
