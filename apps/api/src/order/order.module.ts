import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { BullModule } from '@nestjs/bull';
import { OrderProcessor } from '../queue/order.processor';

@Module({
  imports: [
    JwtModule.register({}),
    BullModule.registerQueue({ name: 'order' }),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderProcessor],
})
export class OrderModule {}
