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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';
import {
  CreateMarketPriceDto,
  UserListQueryDto,
  MarketPriceQueryDto,
} from './dto/admin.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  // --- Dashboard ---
  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  // --- Users ---
  @Get('users')
  listUsers(@Query() query: UserListQueryDto) {
    return this.adminService.listUsers(query);
  }

  @Patch('users/:id/verify')
  verifyUser(@Param('id') id: string) {
    return this.adminService.verifyUser(id);
  }

  @Patch('users/:id/ban')
  banUser(@Param('id') id: string) {
    return this.adminService.banUser(id);
  }

  @Patch('users/:id/unban')
  unbanUser(@Param('id') id: string) {
    return this.adminService.unbanUser(id);
  }

  // --- Market Prices ---
  @Post('market-prices')
  createMarketPrice(@Body() dto: CreateMarketPriceDto) {
    return this.adminService.createMarketPrice(dto);
  }

  @Get('market-prices')
  listMarketPrices(@Query() query: MarketPriceQueryDto) {
    return this.adminService.listMarketPrices(query);
  }

  @Delete('market-prices/:id')
  deleteMarketPrice(@Param('id') id: string) {
    return this.adminService.deleteMarketPrice(id);
  }
}
