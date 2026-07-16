import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { authenticateSocket } from '../common/ws-auth.util';
import { ChatService } from './chat.service';
import { NotificationService } from '../notification/notification.service';

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
    private notificationService: NotificationService,
  ) {}

  handleConnection(client: Socket) {
    const payload = authenticateSocket(client, this.jwtService);

    if (!payload) {
      this.logger.warn(`Unauthorized chat socket: ${client.id}`);
      client.disconnect();
      return;
    }

    client.data.userId = payload.sub;
    this.logger.log(`Chat: user ${payload.sub} connected (${client.id})`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Chat: socket disconnected (${client.id})`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const userId = client.data.userId as string;
    try {
      await this.chatService.verifyParticipant(data.roomId, userId);
      await client.join(data.roomId);
      client.emit('joinedRoom', { roomId: data.roomId });
    } catch {
      client.emit('error', { message: 'Cannot join this room' });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; content: string },
  ) {
    const userId = client.data.userId as string;

    try {
      const room = await this.chatService.verifyParticipant(
        data.roomId,
        userId,
      );
      const message = await this.chatService.createMessage(
        data.roomId,
        userId,
        data.content,
      );

      // Room-এর সবাইকে (সেন্ডার সহ) message broadcast
      this.server.to(data.roomId).emit('newMessage', message);

      // অন্য পক্ষকে notification পাঠাও (সে সেই মুহূর্তে room-এ না থাকলেও যেন জানতে পারে)
      const otherUserId = this.chatService.getOtherParticipant(room, userId);
      await this.notificationService.notify({
        userId: otherUserId,
        title: 'নতুন মেসেজ',
        body: data.content.slice(0, 100),
        type: 'CHAT',
      });
    } catch (err) {
      client.emit('error', {
        message: err instanceof Error ? err.message : 'Failed to send message',
      });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const userId = client.data.userId as string;
    // সেন্ডার ছাড়া room-এর বাকিদের কাছে পাঠাও
    client.to(data.roomId).emit('userTyping', { userId });
  }

  @SubscribeMessage('messageRead')
  async handleMessageRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const userId = client.data.userId as string;
    await this.chatService.markAsRead(data.roomId, userId);
    this.server.to(data.roomId).emit('messagesRead', { userId });
  }
}
