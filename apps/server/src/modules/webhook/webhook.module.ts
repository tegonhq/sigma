import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from 'nestjs-prisma';

import { IntegrationsModule } from 'modules/integrations/integrations.module';

import { WebhookController } from './webhook.controller';
import WebhookService from './webhook.service';

@Module({
  imports: [PrismaModule, IntegrationsModule],
  controllers: [WebhookController],
  providers: [PrismaService, WebhookService],
  exports: [],
})
export class WebhookModule {}
