import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(sellerId: string, dto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: { ...dto, sellerId },
      include: {
        category: true,
        seller: { select: { id: true, name: true, avatar: true } },
      },
    });
    return { success: true, data: product };
  }

  async findAll(filters?: { categoryId?: string; location?: string }) {
    const products = await this.prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        ...(filters?.categoryId && { categoryId: filters.categoryId }),
        ...(filters?.location && {
          location: { contains: filters.location, mode: 'insensitive' },
        }),
      },
      include: {
        category: true,
        seller: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: products };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        seller: {
          select: { id: true, name: true, avatar: true, phone: true },
        },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return { success: true, data: product };
  }

  async findMyProducts(sellerId: string) {
    const products = await this.prisma.product.findMany({
      where: { sellerId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: products };
  }

  async findRelated(productId: string, categoryId: string) {
    const products = await this.prisma.product.findMany({
      where: {
        categoryId,
        status: 'ACTIVE',
        id: { not: productId },
      },
      include: {
        category: true,
        seller: { select: { id: true, name: true, avatar: true } },
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: products };
  }

  async update(id: string, sellerId: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    if (product.sellerId !== sellerId)
      throw new ForbiddenException('Access denied');

    const updated = await this.prisma.product.update({
      where: { id },
      data: dto,
    });
    return { success: true, data: updated };
  }

  async remove(id: string, sellerId: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    if (product.sellerId !== sellerId)
      throw new ForbiddenException('Access denied');

    await this.prisma.product.delete({ where: { id } });
    return { success: true, message: 'Product deleted successfully' };
  }
}
