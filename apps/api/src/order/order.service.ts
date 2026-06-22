import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async create(buyerId: string, dto: CreateOrderDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) throw new NotFoundException('Product not found');
    if (product.status !== 'ACTIVE')
      throw new BadRequestException('Product not available');
    if (product.sellerId === buyerId)
      throw new BadRequestException('Cannot order your own product');
    if (dto.quantity > product.quantity) {
      throw new BadRequestException(
        'Requested quantity exceeds available stock',
      );
    }

    const totalPrice = product.price * dto.quantity;
    const remainingQuantity = product.quantity - dto.quantity;

    try {
      // Transaction: অর্ডার তৈরি + স্টক চেক ও আপডেট একসাথে সফল বা ব্যর্থ হবে
      const order = await this.prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            productId: dto.productId,
            buyerId,
            quantity: dto.quantity,
            totalPrice,
            address: dto.address,
            deliveryLat: dto.deliveryLat,
            deliveryLng: dto.deliveryLng,
          },
          include: {
            product: {
              include: {
                seller: { select: { id: true, name: true, phone: true } },
              },
            },
          },
        });

        // এখানে `quantity: { gte: dto.quantity }` দিয়ে রেস কন্ডিশন বা কনকারেন্সি লক করা হয়েছে
        await tx.product.update({
          where: {
            id: dto.productId,
            quantity: { gte: dto.quantity },
          },
          data: {
            quantity: remainingQuantity,
            ...(remainingQuantity <= 0 && { status: 'SOLD' }),
          },
        });

        return newOrder;
      });

      return { success: true, data: order };
    } catch (error) {
      // যদি ২ জন ইউজার একসাথে রিকোয়েস্ট করে এবং স্টক শেষ হয়ে যায়, তবে প্রিজমা আপডেট ফেল করবে এবং এখানে ক্যাচ হবে
      throw new BadRequestException(
        'Order failed due to insufficient stock or concurrent update',
      );
    }
  }

  async findMyOrders(buyerId: string) {
    const orders = await this.prisma.order.findMany({
      where: { buyerId },
      include: { product: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: orders };
  }

  async findSellerOrders(sellerId: string) {
    const orders = await this.prisma.order.findMany({
      where: { product: { sellerId } },
      include: {
        product: true,
        buyer: { select: { id: true, name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: orders };
  }

  async findOne(id: string, userId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        product: { include: { seller: true, category: true } },
        buyer: { select: { id: true, name: true, phone: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');

    const isBuyer = order.buyerId === userId;
    const isSeller = order.product.sellerId === userId;
    if (!isBuyer && !isSeller) throw new ForbiddenException('Access denied');

    return { success: true, data: order };
  }

  async updateStatus(id: string, sellerId: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { product: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.product.sellerId !== sellerId) {
      throw new ForbiddenException('Only seller can update order status');
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
    });

    return { success: true, data: updated };
  }

  async cancel(id: string, buyerId: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.buyerId !== buyerId)
      throw new ForbiddenException('Access denied');
    if (order.status !== 'PENDING') {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    // Transaction: অর্ডার ক্যানসেল করার সাথে সাথে প্রোডাক্টের স্টক ফেরত দেওয়া
    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      await tx.product.update({
        where: { id: order.productId },
        data: {
          quantity: { increment: order.quantity }, // প্রিজমার increment ব্যবহার করে স্টক বাড়ানো হলো
          status: 'ACTIVE', // যেহেতু স্টক ফেরত এসেছে, প্রোডাক্ট আবার ACTIVE মোডে যাবে
        },
      });

      return updatedOrder;
    });

    return { success: true, data: updated };
  }
}
