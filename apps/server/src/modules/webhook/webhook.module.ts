import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from 'nestjs-prisma';

import { IntegrationsService } from 'modules/integrations/integrations.service';
import { TasksModule } from 'modules/tasks/tasks.module';
import { UsersService } from 'modules/users/users.service';

import { WebhookController } from './webhook.controller';
import WebhookService from './webhook.service';

@Module({
  imports: [PrismaModule, TasksModule],
  controllers: [WebhookController],
  providers: [PrismaService, WebhookService, UsersService, IntegrationsService],
  exports: [],
})
export class WebhookModule {}
