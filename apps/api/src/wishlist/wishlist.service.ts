import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async add(userId: string, productId: string) {
    // Product আছে কিনা check
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    // Already wishlist এ আছে কিনা check
    const existing = await this.prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) throw new ConflictException('Product already in wishlist');

    const wishlist = await this.prisma.wishlist.create({
      data: { userId, productId },
      include: {
        product: {
          include: {
            category: true,
            seller: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
    });
    return { success: true, data: wishlist };
  }

  async remove(userId: string, productId: string) {
    const existing = await this.prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (!existing) throw new NotFoundException('Product not in wishlist');

    await this.prisma.wishlist.delete({
      where: { userId_productId: { userId, productId } },
    });
    return { success: true, message: 'Removed from wishlist' };
  }

  async findAll(userId: string) {
    const wishlist = await this.prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true,
            seller: { select: { id: true, name: true, avatar: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: wishlist };
  }

  async check(userId: string, productId: string) {
    const existing = await this.prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    return { success: true, data: { isWishlisted: !!existing } };
  }
}
