import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async create(buyerId: string, dto: CreateReviewDto) {
    // Order exist + delivered কিনা check
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { product: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.buyerId !== buyerId)
      throw new ForbiddenException('Only buyer can review');
    if (order.status !== 'DELIVERED' && order.status !== 'COMPLETED')
      throw new BadRequestException('Can only review delivered orders');

    // Already review দিয়েছে কিনা
    const existing = await this.prisma.review.findUnique({
      where: { orderId: dto.orderId },
    });
    if (existing) throw new ConflictException('Already reviewed this order');

    const review = await this.prisma.review.create({
      data: {
        orderId: dto.orderId,
        buyerId,
        sellerId: order.product.sellerId,
        rating: dto.rating,
        comment: dto.comment,
      },
      include: {
        buyer: { select: { id: true, name: true, avatar: true } },
        order: { include: { product: true } },
      },
    });

    return { success: true, data: review };
  }

  async findSellerReviews(sellerId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { sellerId },
      include: {
        buyer: { select: { id: true, name: true, avatar: true } },
        order: { include: { product: { select: { title: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Average rating calculate
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return {
      success: true,
      data: {
        reviews,
        totalReviews: reviews.length,
        averageRating: Math.round(avgRating * 10) / 10,
      },
    };
  }

  async findProductReviews(productId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { order: { productId } },
      include: {
        buyer: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return {
      success: true,
      data: {
        reviews,
        totalReviews: reviews.length,
        averageRating: Math.round(avgRating * 10) / 10,
      },
    };
  }
}
