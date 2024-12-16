import { Injectable } from '@nestjs/common';
import {
  EventBody,
  EventHeaders,
  IntegrationPayloadEventType,
} from '@sigma/types';
import { Response } from 'express';
import { PrismaService } from 'nestjs-prisma';

import {
  createAxiosInstance,
  getRequires,
  loadRemoteModule,
} from 'common/remote-loader';

import { LoggerService } from 'modules/logger/logger.service';
import { UsersService } from 'modules/users/users.service';

@Injectable()
export default class WebhookService {
  private readonly logger: LoggerService = new LoggerService('WebhookService'); // Logger instance for logging

  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async handleEvents(
    response: Response,
    sourceName: string,
    accountId: string | undefined,
    eventHeaders: EventHeaders,
    eventBody: EventBody,
  ) {
    this.logger.log({
      message: `Received webhook ${sourceName}`,
      where: `WebhookService.handleEvents`,
    });

    response.status(200);

    if (!accountId) {
      const integrationFunction = await loadRemoteModule(
        getRequires(createAxiosInstance('')),
      );

      const integration = await integrationFunction(
        `file:///Users/manoj/work/sigma-integrations/${sourceName}/dist/backend/index.js`,
      );

      const accountIdResponse = await integration.run({
        event: IntegrationPayloadEventType.GET_CONNECTED_ACCOUNT_ID,
        eventBody,
      });

      if (accountIdResponse?.message?.startsWith('The event payload type is')) {
        accountId = undefined;
      } else {
        accountId = accountIdResponse;
      }
    }

    if (accountId) {
      const integrationAccount = await this.prisma.integrationAccount.findFirst(
        { where: { accountId }, include: { integrationDefinition: true } },
      );

      const pat = await this.usersService.getOrCreatePat(
        integrationAccount.integratedById,
        integrationAccount.workspaceId,
      );

      const integrationFunction = await loadRemoteModule(
        getRequires(createAxiosInstance(pat)),
      );

      const integration = await integrationFunction(
        `file:///Users/manoj/work/sigma-integrations/${sourceName}/dist/backend/index.js`,
      );

      await integration.run({
        event: IntegrationPayloadEventType.WEBHOOK_RESPONSE,
        eventBody: {
          integrationAccount,
          eventData: { eventBody, eventHeaders },
        },
      });
    } else {
      this.logger.log({
        message: `Could not find accountId for webhook ${sourceName}`,
        where: 'WebhookService.handleEvents',
      });
    }

    return { status: 200 };
  }
}
