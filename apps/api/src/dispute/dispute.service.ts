import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateDisputeDto,
  ResolveDisputeDto,
  DisputeOutcome,
} from './dto/dispute.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class DisputeService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async create(userId: string, dto: CreateDisputeDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { product: true },
    });

    if (!order) throw new NotFoundException('Order not found');

    const isBuyer = order.buyerId === userId;
    const isSeller = order.product.sellerId === userId;
    if (!isBuyer && !isSeller) throw new ForbiddenException('Access denied');

    if (order.status !== 'DELIVERED') {
      throw new BadRequestException(
        'Dispute can only be raised for delivered orders',
      );
    }

    const existing = await this.prisma.dispute.findUnique({
      where: { orderId: dto.orderId },
    });
    if (existing) {
      throw new BadRequestException('A dispute already exists for this order');
    }

    const dispute = await this.prisma.$transaction(async (tx: any) => {
      const newDispute = await tx.dispute.create({
        data: {
          orderId: dto.orderId,
          raisedById: userId,
          reason: dto.reason,
        },
      });

      await tx.order.update({
        where: { id: dto.orderId },
        data: { status: 'DISPUTED' },
      });

      return newDispute;
    });

    // Notify the other party
    const otherPartyId = isBuyer ? order.product.sellerId : order.buyerId;
    await this.notificationService.notify({
      userId: otherPartyId,
      title: 'Dispute raised on your order',
      body: `A dispute has been raised for Order #${order.id.slice(-6)}.`,
      type: 'ORDER',
    });

    return { success: true, data: dispute };
  }

  async findMyDisputes(userId: string) {
    return await this.prisma.dispute.findMany({
      where: {
        OR: [
          { raisedById: userId },
          { order: { buyerId: userId } },
          { order: { product: { sellerId: userId } } },
        ],
      },
      include: {
        order: { include: { product: true } },
        raisedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Admin-only — list all pending disputes
  async findAll() {
    return await this.prisma.dispute.findMany({
      where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } },
      include: {
        order: {
          include: {
            product: true,
            buyer: { select: { id: true, name: true } },
          },
        },
        raisedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: {
        order: { include: { product: true, buyer: true } },
        raisedBy: { select: { id: true, name: true } },
      },
    });
    if (!dispute) throw new NotFoundException('Dispute not found');
    return dispute;
  }

  // Admin-only — resolve a dispute
  async resolve(id: string, dto: ResolveDisputeDto) {
    const dispute = await this.findOne(id);

    if (dispute.status === 'RESOLVED' || dispute.status === 'CLOSED') {
      throw new BadRequestException('This dispute is already resolved');
    }

    const newOrderStatus =
      dto.outcome === DisputeOutcome.REFUND ? 'REFUNDED' : 'COMPLETED';

    const updated = await this.prisma.$transaction(async (tx: any) => {
      const resolvedDispute = await tx.dispute.update({
        where: { id },
        data: {
          status: 'RESOLVED',
          resolution: dto.resolution,
        },
      });

      await tx.order.update({
        where: { id: dispute.orderId },
        data: { status: newOrderStatus },
      });

      // If refund outcome, restore stock
      if (dto.outcome === DisputeOutcome.REFUND) {
        await tx.product.update({
          where: { id: dispute.order.productId },
          data: {
            quantity: { increment: dispute.order.quantity },
            status: 'ACTIVE',
          },
        });
      }

      return resolvedDispute;
    });

    // Notify both parties
    await this.notificationService.notify({
      userId: dispute.order.buyerId,
      title: 'Dispute resolved',
      body: dto.resolution,
      type: 'ORDER',
    });
    await this.notificationService.notify({
      userId: dispute.order.product.sellerId,
      title: 'Dispute resolved',
      body: dto.resolution,
      type: 'ORDER',
    });

    return { success: true, data: updated };
  }
}
