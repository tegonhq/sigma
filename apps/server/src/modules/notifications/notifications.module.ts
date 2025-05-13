import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from 'nestjs-prisma';

import { UsersService } from 'modules/users/users.service';

import { NotificationController } from './notifications.controller';
import NotificationsService from './notifications.service';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationController],
  providers: [NotificationsService, PrismaService, UsersService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
