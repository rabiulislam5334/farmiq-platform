import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

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

  async findAll(query: ProductQueryDto) {
    const where: any = { status: 'ACTIVE' };

    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.location) {
      where.location = { contains: query.location, mode: 'insensitive' };
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: true,
          seller: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      success: true,
      data: products,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
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

  async findMyProducts(sellerId: string, page = 1, limit = 20) {
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: { sellerId },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where: { sellerId } }),
    ]);

    return {
      success: true,
      data: products,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
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
