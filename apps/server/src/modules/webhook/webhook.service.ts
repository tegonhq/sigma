import { Injectable } from '@nestjs/common';
import { EventBody, EventHeaders } from '@sigma/types';
import { Response } from 'express';
import { PrismaService } from 'nestjs-prisma';

import loadRemoteModule from 'common/remote-loader/load-remote-module';

import ActivityService from 'modules/activity/activity.service';
import { LoggerService } from 'modules/logger/logger.service';
import { TasksService } from 'modules/tasks/tasks.service';

@Injectable()
export default class WebhookService {
  private readonly logger: LoggerService = new LoggerService('WebhookService'); // Logger instance for logging

  constructor(
    private prisma: PrismaService,
    private activityService: ActivityService,
    private tasksService: TasksService,
  ) {}

  async handleEvents(
    response: Response,
    sourceName: string,
    eventHeaders: EventHeaders,
    eventBody: EventBody,
  ) {
    this.logger.log({
      message: `Received webhook ${sourceName}`,
      where: `WebhookService.handleEvents`,
    });

    response.status(200);

    const integration = await loadRemoteModule(
      `file:///Users/manoj/work/sigma-integrations/github/dist/backend/index.js`,
    );

    const { accountId, activity, task } = await integration.webhookHandler({
      eventBody,
      eventHeaders,
    });

    const integrationAccount = await this.prisma.integrationAccount.findFirst({
      where: { accountId, deleted: null },
    });

    console.log(activity);
    await this.activityService.createActivity(integrationAccount.workspaceId, {
      ...activity,
      integrationAccountId: integrationAccount.id,
    });

    await this.tasksService.createTask(
      { ...task },
      integrationAccount.workspaceId,
    );

    if (!activity) {
      response.status(401).send('Not valid signature');
    } else {
      response.status(200).json(activity);
    }

    return { status: 200 };
  }
}
