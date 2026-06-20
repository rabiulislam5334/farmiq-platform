import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FarmService } from './farm.service';
import { CreateFarmDto, UpdateFarmDto } from './dto/farm.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import type { Request } from 'express';

@Controller('farms')
@UseGuards(JwtAuthGuard)
export class FarmController {
  constructor(private readonly farmService: FarmService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateFarmDto) {
    const userId = (req['user'] as { sub: string }).sub;
    return this.farmService.create(userId, dto);
  }

  @Get()
  findAll(@Req() req: Request) {
    const userId = (req['user'] as { sub: string }).sub;
    return this.farmService.findAll(userId);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const userId = (req['user'] as { sub: string }).sub;
    return this.farmService.findOne(id, userId);
  }

  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateFarmDto,
  ) {
    const userId = (req['user'] as { sub: string }).sub;
    return this.farmService.update(id, userId, dto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    const userId = (req['user'] as { sub: string }).sub;
    return this.farmService.remove(id, userId);
  }
}
