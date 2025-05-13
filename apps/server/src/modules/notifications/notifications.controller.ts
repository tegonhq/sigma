import { Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';

import { AuthGuard } from 'modules/auth/auth.guard';
import { Workspace } from 'modules/auth/session.decorator';

import { NotificationIdDto } from './notifications.interface';
import NotificationsService from './notifications.service';

@Controller({
  version: '1',
  path: 'notifications',
})
export class NotificationController {
  constructor(private notifications: NotificationsService) {}

  @Post(':notificationId/read')
  @UseGuards(AuthGuard)
  async readNotification(@Param() notificationDto: NotificationIdDto) {
    return await this.notifications.readNotification(
      notificationDto.notificationId,
    );
  }

  @Delete()
  @UseGuards(AuthGuard)
  async deleteAllRead(@Workspace() workspaceId: string) {
    return await this.notifications.deleteReadNotification(workspaceId);
  }

  @Delete(':notificationId')
  @UseGuards(AuthGuard)
  async deleteNotification(@Param() notificationDto: NotificationIdDto) {
    return await this.notifications.deleteNotification(
      notificationDto.notificationId,
    );
  }
}
