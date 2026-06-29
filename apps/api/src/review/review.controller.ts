import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import type { Request } from 'express';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: Request, @Body() dto: CreateReviewDto) {
    const buyerId = (req['user'] as { sub: string }).sub;
    return this.reviewService.create(buyerId, dto);
  }

  @Get('seller/:sellerId')
  findSellerReviews(@Param('sellerId') sellerId: string) {
    return this.reviewService.findSellerReviews(sellerId);
  }

  @Get('product/:productId')
  findProductReviews(@Param('productId') productId: string) {
    return this.reviewService.findProductReviews(productId);
  }
}
