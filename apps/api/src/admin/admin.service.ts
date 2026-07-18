import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateMarketPriceDto,
  UserListQueryDto,
  MarketPriceQueryDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // --- Dashboard Analytics ---
  async getDashboardStats() {
    const [
      totalUsers,
      usersByRole,
      totalOrders,
      ordersByStatus,
      totalProducts,
      activeProducts,
      pendingDisputes,
      revenue,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.groupBy({ by: ['role'], _count: { role: true } }),
      this.prisma.order.count(),
      this.prisma.order.groupBy({ by: ['status'], _count: { status: true } }),
      this.prisma.product.count(),
      this.prisma.product.count({ where: { status: 'ACTIVE' } }),
      this.prisma.dispute.count({
        where: { status: { in: ['OPEN', 'UNDER_REVIEW'] } },
      }),
      this.prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      }),
    ]);

    return {
      success: true,
      data: {
        totalUsers,
        usersByRole,
        totalOrders,
        ordersByStatus,
        totalProducts,
        activeProducts,
        pendingDisputes,
        totalRevenue: revenue._sum.amount || 0,
      },
    };
  }

  // --- User Management ---
  async listUsers(query: UserListQueryDto) {
    const where: any = {};

    if (query.role) where.role = query.role;
    if (query.isVerified !== undefined) where.isVerified = query.isVerified;
    if (query.isBanned !== undefined) where.isBanned = query.isBanned;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isVerified: true,
          isBanned: true,
          createdAt: true,
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      success: true,
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async verifyUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isVerified: true },
      select: { id: true, name: true, email: true, isVerified: true },
    });

    return { success: true, data: updated };
  }

  async banUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'ADMIN') {
      throw new BadRequestException('Cannot ban an admin account');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isBanned: true },
      select: { id: true, name: true, email: true, isBanned: true },
    });

    return { success: true, data: updated };
  }

  async unbanUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isBanned: false },
      select: { id: true, name: true, email: true, isBanned: true },
    });

    return { success: true, data: updated };
  }

  // --- Market Price ---
  async createMarketPrice(dto: CreateMarketPriceDto) {
    const price = await this.prisma.marketPrice.create({ data: dto });
    return { success: true, data: price };
  }

  async listMarketPrices(query: MarketPriceQueryDto) {
    const where: any = {};

    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.search) {
      where.cropName = { contains: query.search, mode: 'insensitive' };
    }

    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const sortBy = query.sortBy || 'date';
    const sortOrder = query.sortOrder || 'desc';

    const [prices, total] = await Promise.all([
      this.prisma.marketPrice.findMany({
        where,
        include: { category: true },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.marketPrice.count({ where }),
    ]);

    return {
      success: true,
      data: prices,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deleteMarketPrice(id: string) {
    const existing = await this.prisma.marketPrice.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Market price entry not found');

    await this.prisma.marketPrice.delete({ where: { id } });
    return { success: true, message: 'Market price deleted' };
  }
}
