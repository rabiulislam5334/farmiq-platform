import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
