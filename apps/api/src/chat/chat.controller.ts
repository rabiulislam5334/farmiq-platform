import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { ChatService } from './chat.service';

@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('rooms')
  createRoom(@Body('productId') productId: string, @Req() req: any) {
    return this.chatService.getOrCreateRoom(req.user.sub, productId);
  }

  @Get('rooms')
  getMyRooms(@Req() req: any) {
    return this.chatService.getMyRooms(req.user.sub);
  }

  @Get('rooms/:id/messages')
  getMessages(@Param('id') id: string, @Req() req: any) {
    return this.chatService.getMessages(id, req.user.sub);
  }
}
