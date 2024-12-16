import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from 'nestjs-prisma';

import ActivityService from 'modules/activity/activity.service';
import { TasksModule } from 'modules/tasks/tasks.module';
import { UsersService } from 'modules/users/users.service';

import { WebhookController } from './webhook.controller';
import WebhookService from './webhook.service';

@Module({
  imports: [PrismaModule, TasksModule],
  controllers: [WebhookController],
  providers: [PrismaService, WebhookService, ActivityService, UsersService],
  exports: [],
})
export class WebhookModule {}
