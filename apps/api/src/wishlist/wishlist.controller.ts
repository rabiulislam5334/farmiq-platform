import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import type { Request } from 'express';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post(':productId')
  add(@Req() req: Request, @Param('productId') productId: string) {
    const userId = (req['user'] as { sub: string }).sub;
    return this.wishlistService.add(userId, productId);
  }

  @Delete(':productId')
  remove(@Req() req: Request, @Param('productId') productId: string) {
    const userId = (req['user'] as { sub: string }).sub;
    return this.wishlistService.remove(userId, productId);
  }

  @Get()
  findAll(@Req() req: Request) {
    const userId = (req['user'] as { sub: string }).sub;
    return this.wishlistService.findAll(userId);
  }

  @Get('check/:productId')
  check(@Req() req: Request, @Param('productId') productId: string) {
    const userId = (req['user'] as { sub: string }).sub;
    return this.wishlistService.check(userId, productId);
  }
}
