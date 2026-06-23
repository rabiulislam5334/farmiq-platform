import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
    if (dto.quantity > product.quantity)
      throw new BadRequestException(
        'Requested quantity exceeds available stock',
      );

    const existingOrders = await this.prisma.order.count({
      where: { buyerId, productId: dto.productId, status: 'PENDING' },
    });
    if (existingOrders >= 5)
      throw new BadRequestException('Order limit exceeded for this product');

    const totalPrice = product.price * dto.quantity;
    const remainingQuantity = product.quantity - dto.quantity;

    const order = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
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

        // Optimistic Locking — race condition prevent
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
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['SHIPPED'],
      SHIPPED: ['DELIVERED'],
      DELIVERED: [],
      CANCELLED: [],
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
    if (order.status !== 'PENDING')
      throw new BadRequestException('Only pending orders can be cancelled');

    const updated = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
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
      },
    );

    return { success: true, data: updated };
  }
}
