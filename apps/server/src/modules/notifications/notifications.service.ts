import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export default class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async readNotification(notificationId: string) {
    await this.prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        read: true,
      },
    });
  }

  async deleteNotification(notificationId: string) {
    await this.prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        deleted: new Date(),
      },
    });
  }

  async deleteReadNotification(workspaceId: string) {
    await this.prisma.notification.updateMany({
      where: {
        workspaceId,
        read: true,
      },
      data: {
        deleted: new Date(),
      },
    });
  }
}
