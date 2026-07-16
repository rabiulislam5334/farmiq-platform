import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationGateway } from './notification.gateway';

type NotificationType =
  | 'ORDER'
  | 'PAYMENT'
  | 'CHAT'
  | 'WEATHER'
  | 'DISEASE'
  | 'MARKET'
  | 'SYSTEM';

interface CreateNotificationInput {
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
}

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private notificationGateway: NotificationGateway,
  ) {}

  async notify(input: CreateNotificationInput) {
    const notification = await this.prisma.notification.create({
      data: input,
    });

    this.notificationGateway.sendToUser(
      input.userId,
      'notification',
      notification,
    );

    return notification;
  }

  async findMyNotifications(userId: string) {
    return await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string, userId: string) {
    return await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }
}
