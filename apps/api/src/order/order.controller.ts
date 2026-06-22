import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import type { Request } from 'express';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateOrderDto) {
    const buyerId = (req['user'] as { sub: string }).sub;
    return this.orderService.create(buyerId, dto);
  }

  @Get('my-orders')
  findMyOrders(@Req() req: Request) {
    const buyerId = (req['user'] as { sub: string }).sub;
    return this.orderService.findMyOrders(buyerId);
  }

  @Get('seller-orders')
  findSellerOrders(@Req() req: Request) {
    const sellerId = (req['user'] as { sub: string }).sub;
    return this.orderService.findSellerOrders(sellerId);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const userId = (req['user'] as { sub: string }).sub;
    return this.orderService.findOne(id, userId);
  }

  @Patch(':id/status')
  updateStatus(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const sellerId = (req['user'] as { sub: string }).sub;
    return this.orderService.updateStatus(id, sellerId, dto);
  }

  @Patch(':id/cancel')
  cancel(@Req() req: Request, @Param('id') id: string) {
    const buyerId = (req['user'] as { sub: string }).sub;
    return this.orderService.cancel(id, buyerId);
  }
}
