import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import type { Request } from 'express';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: Request, @Body() dto: CreateProductDto) {
    const sellerId = (req['user'] as { sub: string }).sub;
    return this.productService.create(sellerId, dto);
  }

  @Get()
  findAll(
    @Query('categoryId') categoryId?: string,
    @Query('location') location?: string,
  ) {
    return this.productService.findAll({ categoryId, location });
  }

  @Get('my-products')
  @UseGuards(JwtAuthGuard)
  findMyProducts(@Req() req: Request) {
    const sellerId = (req['user'] as { sub: string }).sub;
    return this.productService.findMyProducts(sellerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }
  @Get(':id/related')
  async findRelated(@Param('id') id: string) {
    const product = await this.productService.findOne(id);
    return this.productService.findRelated(id, product.data.categoryId);
  }
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    const sellerId = (req['user'] as { sub: string }).sub;
    return this.productService.update(id, sellerId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Req() req: Request, @Param('id') id: string) {
    const sellerId = (req['user'] as { sub: string }).sub;
    return this.productService.remove(id, sellerId);
  }
}
