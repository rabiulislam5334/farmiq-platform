import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InitiatePaymentDto, PaymentMethod } from './dto/payment.dto';
import { InventoryService } from '../inventory/inventory.service';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const SSLCommerzPayment = require('sslcommerz-lts');

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private inventoryService: InventoryService,
  ) {}

  async initiate(userId: string, dto: InitiatePaymentDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: {
        product: {
          include: {
            seller: { select: { id: true, name: true } },
          },
        },
        buyer: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    if (order.buyerId !== userId) throw new ForbiddenException('Access denied');
    if (order.status !== 'PAYMENT_PENDING')
      throw new BadRequestException('Order is not in payment pending state');

    const transactionId = `FARMIQ-${Date.now()}-${order.id.slice(-6)}`;

    if (dto.method === PaymentMethod.CASH_ON_DELIVERY) {
      const updated = await this.prisma.order.update({
        where: { id: dto.orderId },
        data: { status: 'PAYMENT_CONFIRMED' },
      });

      await this.prisma.payment.create({
        data: {
          orderId: dto.orderId,
          userId,
          amount: order.totalPrice,
          method: 'CASH_ON_DELIVERY',
          status: 'PENDING',
          transactionId,
        },
      });

      // COD নিশ্চিত হলে stock স্থায়ীভাবে DB-তে decrement হয়েই আছে,
      // তাই আর Redis reservation ধরে রাখার দরকার নেই
      await this.inventoryService.releaseStock(order.productId, order.id);

      return {
        success: true,
        data: { method: 'CASH_ON_DELIVERY', order: updated },
      };
    }

    if (dto.method === PaymentMethod.SSLCOMMERZ) {
      const data = {
        total_amount: order.totalPrice,
        currency: 'BDT',
        tran_id: transactionId,
        success_url: `${process.env.CLIENT_URL}/payment/success?tran_id=${transactionId}`,
        fail_url: `${process.env.CLIENT_URL}/payment/fail?tran_id=${transactionId}`,
        cancel_url: `${process.env.CLIENT_URL}/payment/cancel?tran_id=${transactionId}`,
        ipn_url: `${process.env.SERVER_URL || 'http://localhost:4000'}/payment/ipn`,
        product_name: order.product.title,
        product_category: 'Agriculture',
        product_profile: 'general',
        cus_name: order.buyer.name,
        cus_email: order.buyer.email,
        cus_phone: order.buyer.phone || '01700000000',
        cus_add1: order.address || 'Bangladesh',
        cus_city: 'Dhaka',
        cus_country: 'Bangladesh',
        ship_name: order.buyer.name,
        ship_add1: order.address || 'Bangladesh',
        ship_city: 'Dhaka',
        ship_country: 'Bangladesh',
        shipping_method: 'NO',
        num_of_item: 1,
        value_a: order.id,
        value_b: userId,
      };

      const sslcz = new SSLCommerzPayment(
        process.env.SSLCOMMERZ_STORE_ID,
        process.env.SSLCOMMERZ_STORE_PASSWORD,
        process.env.SSLCOMMERZ_IS_LIVE === 'true',
      );

      const response = (await sslcz.init(data)) as {
        GatewayPageURL?: string;
        status?: string;
      };

      if (!response?.GatewayPageURL) {
        throw new BadRequestException('Failed to initiate payment');
      }

      await this.prisma.payment.create({
        data: {
          orderId: dto.orderId,
          userId,
          amount: order.totalPrice,
          method: 'SSLCOMMERZ',
          status: 'PENDING',
          transactionId,
          gatewayData: data as any,
        },
      });

      return {
        success: true,
        data: {
          paymentUrl: response.GatewayPageURL,
          transactionId,
        },
      };
    }

    throw new BadRequestException('Payment method not supported yet');
  }

  async handleSuccess(tran_id: string, val_id: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { transactionId: tran_id },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    const sslcz = new SSLCommerzPayment(
      process.env.SSLCOMMERZ_STORE_ID,
      process.env.SSLCOMMERZ_STORE_PASSWORD,
      process.env.SSLCOMMERZ_IS_LIVE === 'true',
    );

    const validation = (await sslcz.validate({ val_id })) as {
      status?: string;
      amount?: string;
      currency?: string;
    };

    if (validation?.status !== 'VALID' && validation?.status !== 'VALIDATED') {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });
      throw new BadRequestException('Payment validation failed');
    }

    // ✅ Amount mismatch check — fraud prevention
    const paidAmount = Number(validation.amount);
    if (Math.abs(paidAmount - payment.amount) > 1) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });
      throw new BadRequestException(
        `Amount mismatch! Expected: ${payment.amount}, Paid: ${paidAmount}. Fraud detected.`,
      );
    }

    // productId দরকার Redis reservation release করার জন্য
    const order = await this.prisma.order.findUnique({
      where: { id: payment.orderId },
      select: { productId: true },
    });

    // Payment + Order update
    await this.prisma.$transaction(async (tx: any) => {
      await tx.paymentTransaction.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESS',
          gatewayData: validation as any,
        },
      });
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: 'PAYMENT_CONFIRMED' },
      });
    });

    // Payment confirm হয়ে গেলে Redis reservation আর দরকার নেই
    if (order) {
      await this.inventoryService.releaseStock(
        order.productId,
        payment.orderId,
      );
    }

    return { success: true, message: 'Payment successful' };
  }

  async handleFail(tran_id: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { transactionId: tran_id },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED' },
    });

    // এখানে releaseStock call করা হচ্ছে না ইচ্ছাকৃতভাবে —
    // order এখনো PAYMENT_PENDING, buyer আবার payment retry করতে পারবে,
    // তাই reservation ততক্ষণ ধরে রাখা উচিত (TTL/cancel/auto-cancel যেভাবেই শেষ হোক)

    return { success: false, message: 'Payment failed' };
  }

  async getHistory(userId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { userId },
      include: {
        order: {
          include: {
            product: { select: { title: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: payments };
  }
}
