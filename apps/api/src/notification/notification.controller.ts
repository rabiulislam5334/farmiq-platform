import { Controller, Get, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { NotificationService } from './notification.service';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  findMy(@Req() req: any) {
    return this.notificationService.findMyNotifications(req.user.sub);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @Req() req: any) {
    return this.notificationService.markAsRead(id, req.user.sub);
  }
}
