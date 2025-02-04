import { Injectable } from '@nestjs/common';
import {
  EventBody,
  EventHeaders,
  IntegrationPayloadEventType,
} from '@sigma/types';
import { Response } from 'express';
import { PrismaService } from 'nestjs-prisma';

import { IntegrationsService } from 'modules/integrations/integrations.service';
import { LoggerService } from 'modules/logger/logger.service';

@Injectable()
export default class WebhookService {
  private readonly logger: LoggerService = new LoggerService('WebhookService'); // Logger instance for logging

  constructor(
    private prisma: PrismaService,
    private integrationService: IntegrationsService,
  ) {}

  async handleEvents(
    response: Response,
    sourceName: string,
    integrationAccountId: string | undefined,
    eventHeaders: EventHeaders,
    eventBody: EventBody,
  ) {
    this.logger.log({
      message: `Received webhook ${sourceName}`,
      where: `WebhookService.handleEvents`,
    });

    response.status(200).send({ status: 'acknowleged' });

    let integrationAccount;
    if (!integrationAccountId) {
      const integration =
        await this.integrationService.loadIntegration(sourceName);

      const accountIdResponse = await integration.run({
        event: IntegrationPayloadEventType.GET_CONNECTED_ACCOUNT_ID,
        eventBody,
      });

      let accountId;
      if (accountIdResponse?.message?.startsWith('The event payload type is')) {
        accountId = undefined;
      } else {
        accountId = accountIdResponse;
      }
      integrationAccount = await this.prisma.integrationAccount.findFirst({
        where: { accountId },
        include: { integrationDefinition: true },
      });
    } else {
      integrationAccount = await this.prisma.integrationAccount.findUnique({
        where: { id: integrationAccountId },
        include: { integrationDefinition: true },
      });
    }

    if (integrationAccount) {
      const integration = await this.integrationService.loadIntegration(
        sourceName,
        integrationAccount.integratedById,
        integrationAccount.workspaceId,
      );

      await integration.run({
        event: IntegrationPayloadEventType.SOURCE_WEBHOOK,
        eventBody: {
          integrationAccount,
          eventData: { eventBody, eventHeaders },
        },
      });
    } else {
      this.logger.log({
        message: `Could not find integration account for webhook ${sourceName}`,
        where: 'WebhookService.handleEvents',
      });
    }
  }
}
