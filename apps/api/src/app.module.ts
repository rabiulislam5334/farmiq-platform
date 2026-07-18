import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FarmModule } from './farm/farm.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { OrderModule } from './order/order.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { ReviewModule } from './review/review.module';
import { PaymentModule } from './payment/payment.module';
import { QueueModule } from './queue/queue.module';
import { InventoryModule } from './inventory/inventory.module';
import { NotificationModule } from './notification/notification.module';
import { ChatModule } from './chat/chat.module';
import { DisputeModule } from './dispute/dispute.module';
import { AdminModule } from './admin/admin.module';
import { envValidationSchema } from './config/env.validation';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport:
          process.env.NODE_ENV === 'production'
            ? undefined
            : {
                target: require.resolve('pino-pretty'),
                options: {
                  colorize: true,
                  singleLine: true,
                  translateTime: 'HH:MM:ss',
                },
              },
        redact: ['req.headers.authorization', 'req.headers.cookie'],
        autoLogging: {
          ignore: (req) => req.url === '/health',
        },
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // ৬০ সেকেন্ড window
        limit: 100, // প্রতি IP-তে ৬০ সেকেন্ডে সর্বোচ্চ ১০০ request (default, সব endpoint-এর জন্য)
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    FarmModule,
    CategoryModule,
    ProductModule,
    OrderModule,
    WishlistModule,
    ReviewModule,
    PaymentModule,
    QueueModule,
    InventoryModule,
    NotificationModule,
    ChatModule,
    DisputeModule,
    AdminModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
