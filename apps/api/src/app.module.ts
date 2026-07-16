import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
})
export class AppModule {}
