import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFarmDto, UpdateFarmDto } from './dto/farm.dto';

@Injectable()
export class FarmService {
  constructor(private prisma: PrismaService) {}
  async create(userId: string, dto: CreateFarmDto) {
    const farm = await this.prisma.farm.create({
      data: { ...dto, userId },
    });
    return { success: true, data: farm };
  }
  async findAll(userId: string) {
    const farms = await this.prisma.farm.findMany({
      where: { userId },
      include: { crops: true },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: farms };
  }
  async findOne(id: string, userId: string) {
    const farm = await this.prisma.farm.findUnique({
      where: { id },
      include: { crops: true },
    });
    if (!farm) throw new NotFoundException('Farm not found');
    if (farm.userId !== userId) throw new ForbiddenException('Access denied');
    return { success: true, data: farm };
  }
  async update(id: string, userId: string, dto: UpdateFarmDto) {
    const farm = await this.prisma.farm.findUnique({ where: { id } });
    if (!farm) throw new NotFoundException('Farm not found');
    if (farm.userId !== userId) throw new ForbiddenException('Access denied');

    const updated = await this.prisma.farm.update({
      where: { id },
      data: dto,
    });
    return { success: true, data: updated };
  }
  async remove(id: string, userId: string) {
    const farm = await this.prisma.farm.findUnique({ where: { id } });
    if (!farm) throw new NotFoundException('Farm not found');
    if (farm.userId !== userId) throw new ForbiddenException('Access denied');

    await this.prisma.farm.delete({ where: { id } });
    return { success: true, message: 'Farm deleted successfully' };
  }
}
