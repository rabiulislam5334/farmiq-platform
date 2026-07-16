import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  // Buyer আর seller-এর মধ্যে একটা product নিয়ে room থাকলে সেটা রিটার্ন করে,
  // না থাকলে নতুন বানায়
  async getOrCreateRoom(buyerId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.sellerId === buyerId)
      throw new BadRequestException('Cannot chat with yourself');

    const existing = await this.prisma.chatRoom.findFirst({
      where: { buyerId, sellerId: product.sellerId, productId },
    });
    if (existing) return existing;

    return this.prisma.chatRoom.create({
      data: {
        buyerId,
        sellerId: product.sellerId,
        productId,
      },
    });
  }

  async getMyRooms(userId: string) {
    return this.prisma.chatRoom.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: {
        product: { select: { id: true, title: true, imageUrl: true } },
        buyer: { select: { id: true, name: true } },
        seller: { select: { id: true, name: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // এই user room-টার participant (buyer বা seller) কিনা যাচাই করে
  async verifyParticipant(roomId: string, userId: string) {
    const room = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
    });
    if (!room) throw new NotFoundException('Chat room not found');
    if (room.buyerId !== userId && room.sellerId !== userId)
      throw new ForbiddenException('Access denied');
    return room;
  }

  async getMessages(roomId: string, userId: string) {
    await this.verifyParticipant(roomId, userId);

    return this.prisma.message.findMany({
      where: { roomId },
      include: { sender: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createMessage(roomId: string, senderId: string, content: string) {
    await this.verifyParticipant(roomId, senderId);

    if (!content?.trim()) {
      throw new BadRequestException('Message content cannot be empty');
    }

    return this.prisma.message.create({
      data: { roomId, senderId, content: content.trim() },
      include: { sender: { select: { id: true, name: true } } },
    });
  }

  async markAsRead(roomId: string, userId: string) {
    await this.verifyParticipant(roomId, userId);

    // শুধু অন্য পক্ষের পাঠানো unread message গুলো read করবে
    return this.prisma.message.updateMany({
      where: { roomId, senderId: { not: userId }, read: false },
      data: { read: true },
    });
  }

  // Room-এর অন্য participant-এর id বের করে (notification পাঠানোর জন্য দরকার)
  getOtherParticipant(
    room: { buyerId: string; sellerId: string },
    userId: string,
  ) {
    return room.buyerId === userId ? room.sellerId : room.buyerId;
  }
}
