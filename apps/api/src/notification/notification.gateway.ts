import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { authenticateSocket } from '../common/ws-auth.util';

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(NotificationGateway.name);
  private userSockets = new Map<string, Set<string>>(); // userId -> socket id list

  constructor(private jwtService: JwtService) {}

  handleConnection(client: Socket) {
    const payload = authenticateSocket(client, this.jwtService);

    if (!payload) {
      this.logger.warn(`Unauthorized notification socket: ${client.id}`);
      client.disconnect();
      return;
    }

    client.data.userId = payload.sub;

    if (!this.userSockets.has(payload.sub)) {
      this.userSockets.set(payload.sub, new Set());
    }
    this.userSockets.get(payload.sub)!.add(client.id);

    this.logger.log(`User ${payload.sub} connected (${client.id})`);
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId as string | undefined;
    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId)!.delete(client.id);
      if (this.userSockets.get(userId)!.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  // অন্য service থেকে call হবে — নির্দিষ্ট user online থাকলে event পাঠায়
  sendToUser(userId: string, event: string, payload: unknown) {
    const socketIds = this.userSockets.get(userId);
    if (!socketIds) return; // user অফলাইনে, শুধু DB-তে notification থেকে যাবে

    for (const socketId of socketIds) {
      this.server.to(socketId).emit(event, payload);
    }
  }
}
