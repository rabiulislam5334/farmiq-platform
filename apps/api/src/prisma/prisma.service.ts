import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private client: any;

  constructor() {
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL_POOLER as string,
      ssl: { rejectUnauthorized: false },
    });

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    const adapter = new PrismaPg(pool);
    this.client = new PrismaClient({ adapter } as any);
  }

  // ── Models ──────────────────────────────────
  get user() {
    return this.client.user;
  }
  get farm() {
    return this.client.farm;
  }
  get crop() {
    return this.client.crop;
  }
  get product() {
    return this.client.product;
  }
  get order() {
    return this.client.order;
  }
  get category() {
    return this.client.category;
  }
  get review() {
    return this.client.review;
  }
  get dispute() {
    return this.client.dispute;
  }
  get payment() {
    return this.client.paymentTransaction;
  }
  get message() {
    return this.client.message;
  }
  get chatRoom() {
    return this.client.chatRoom;
  }
  get notification() {
    return this.client.notification;
  }
  get cropAnalysis() {
    return this.client.cropAnalysis;
  }
  get aiChatHistory() {
    return this.client.aiChatHistory;
  }
  get weatherLog() {
    return this.client.weatherLog;
  }
  get marketPrice() {
    return this.client.marketPrice;
  }
  get locationLog() {
    return this.client.locationLog;
  }
  get refreshToken() {
    return this.client.refreshToken;
  }
  get otp() {
    return this.client.oTP;
  }
  get wishlist() {
    return this.client.wishlist;
  }

  // ── Transaction ──────────────────────────────
  async $transaction<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.client.$transaction(fn);
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
