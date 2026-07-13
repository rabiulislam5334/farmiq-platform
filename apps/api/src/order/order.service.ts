import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { InjectQueue } from '@nestjs/bull';
import * as Bull from 'bull';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('order') private orderQueue: Bull.Queue,
  ) {}

  async create(buyerId: string, dto: CreateOrderDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) throw new NotFoundException('Product not found');
    if (product.status !== 'ACTIVE')
      throw new BadRequestException('Product not available');
    if (product.sellerId === buyerId)
      throw new BadRequestException('Cannot order your own product');
    if (dto.quantity > product.quantity)
      throw new BadRequestException(
        'Requested quantity exceeds available stock',
      );

    const existingOrders = await this.prisma.order.count({
      where: {
        buyerId,
        productId: dto.productId,
        status: 'PAYMENT_PENDING',
      },
    });
    if (existingOrders >= 5)
      throw new BadRequestException('Order limit exceeded for this product');

    const totalPrice = product.price * dto.quantity;
    const remainingQuantity = product.quantity - dto.quantity;

    const order = await this.prisma.$transaction(async (tx: any) => {
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
              seller: {
                select: { id: true, name: true, phone: true },
              },
            },
          },
        },
      });

      const stockUpdate = await tx.product.updateMany({
        where: {
          id: dto.productId,
          quantity: { gte: dto.quantity },
        },
        data: {
          quantity: { decrement: dto.quantity },
          ...(remainingQuantity <= 0 && { status: 'SOLD' }),
        },
      });

      if (stockUpdate.count === 0) {
        throw new BadRequestException(
          'Stock unavailable at this moment, please try again',
        );
      }

      return newOrder;
    });

    // 24 ঘণ্টা পর auto-cancel job schedule করো
    await this.orderQueue.add(
      'auto-cancel',
      { orderId: order.id },
      {
        delay: 24 * 60 * 60 * 1000, // 24 hours
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      },
    );

    return { success: true, data: order };
  }

  async findMyOrders(buyerId: string) {
    const orders = await this.prisma.order.findMany({
      where: { buyerId },
      include: {
        product: { include: { category: true } },
      },
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
        product: {
          include: {
            seller: true,
            category: true,
          },
        },
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
    if (order.product.sellerId !== sellerId)
      throw new ForbiddenException('Only seller can update order status');

    const validTransitions: Record<string, string[]> = {
      PAYMENT_PENDING: ['PAYMENT_CONFIRMED', 'CANCELLED'],
      PAYMENT_CONFIRMED: ['SELLER_CONFIRMED', 'SELLER_REJECTED'],
      SELLER_CONFIRMED: ['PROCESSING'],
      SELLER_REJECTED: ['REFUNDED'],
      PROCESSING: ['SHIPPED'],
      SHIPPED: ['OUT_FOR_DELIVERY'],
      OUT_FOR_DELIVERY: ['DELIVERED'],
      DELIVERED: ['COMPLETED', 'DISPUTED'],
      COMPLETED: [],
      CANCELLED: [],
      DISPUTED: ['RESOLVED' as any, 'REFUNDED'],
      REFUNDED: [],
    };

    const allowed = validTransitions[order.status] ?? [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${order.status} to ${dto.status}`,
      );
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
    if (order.status !== 'PAYMENT_PENDING')
      throw new BadRequestException(
        'Only orders pending payment can be cancelled',
      );

    const updated = await this.prisma.$transaction(async (tx: any) => {
      const cancelledOrder = await tx.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      await tx.product.update({
        where: { id: order.productId },
        data: {
          quantity: { increment: order.quantity },
          status: 'ACTIVE',
        },
      });

      return cancelledOrder;
    });

    return { success: true, data: updated };
  }
}
