import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import * as Bull from 'bull';
import { PrismaService } from '../prisma/prisma.service';

@Processor('order')
export class OrderProcessor {
  private readonly logger = new Logger(OrderProcessor.name);

  constructor(private prisma: PrismaService) {}

  @Process('auto-cancel')
  async handleAutoCancel(job: Bull.Job<{ orderId: string }>) {
    const { orderId } = job.data;
    this.logger.log(`Processing auto-cancel for order: ${orderId}`);

    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        this.logger.warn(`Order ${orderId} not found`);
        return;
      }

      // শুধু PAYMENT_PENDING অবস্থায় থাকলে cancel করবে
      if (order.status !== 'PAYMENT_PENDING') {
        this.logger.log(
          `Order ${orderId} is already ${order.status}, skipping cancel`,
        );
        return;
      }

      // Transaction: cancel + stock restore
      await this.prisma.$transaction(async (tx: any) => {
        await tx.order.update({
          where: { id: orderId },
          data: { status: 'CANCELLED' },
        });

        await tx.product.update({
          where: { id: order.productId },
          data: {
            quantity: { increment: order.quantity },
            status: 'ACTIVE',
          },
        });
      });

      this.logger.log(`Order ${orderId} auto-cancelled successfully`);
    } catch (error) {
      this.logger.error(`Failed to auto-cancel order ${orderId}:`, error);
    }
  }
}
