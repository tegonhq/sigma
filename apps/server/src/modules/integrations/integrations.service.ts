import type { integrationRun } from 'triggers/integrations/integration-run';

import { Injectable } from '@nestjs/common';
import { IntegrationDefinition } from '@tegonhq/sigma-sdk';
import { tasks } from '@trigger.dev/sdk/v3';

import { LoggerService } from 'modules/logger/logger.service';
import { UsersService } from 'modules/users/users.service';

@Injectable()
export class IntegrationsService {
  private readonly logger = new LoggerService(IntegrationsService.name);

  constructor(private usersService: UsersService) {}

  private async prepareIntegrationTrigger(
    integrationDefinition: IntegrationDefinition,
    userId?: string,
    workspaceId?: string,
  ) {
    this.logger.info({
      message: `Loading integration ${integrationDefinition.slug}`,
      where: 'IntegrationsService.runIntegrationTrigger',
    });

    const pat = userId
      ? await this.usersService.getOrCreatePat(userId, workspaceId)
      : '';

    return {
      integrationDefinition,
      pat,
    };
  }

  async runIntegrationTriggerAsync(
    integrationDefinition: IntegrationDefinition,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event: any,
    userId?: string,
    workspaceId?: string,
  ) {
    const params = await this.prepareIntegrationTrigger(
      integrationDefinition,
      userId,
      workspaceId,
    );
    return await tasks.trigger<typeof integrationRun>('integration-run', {
      ...params,
      event,
    });
  }

  async runIntegrationTrigger(
    integrationDefinition: IntegrationDefinition,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event: any,
    userId?: string,
    workspaceId?: string,
  ) {
    const params = await this.prepareIntegrationTrigger(
      integrationDefinition,
      userId,
      workspaceId,
    );

    const response = await tasks.triggerAndPoll<typeof integrationRun>(
      'integration-run',
      {
        ...params,
        event,
      },
    );

    if (response.status === 'COMPLETED') {
      return response.output;
    }

    throw new Error(
      `Integration trigger failed with status: ${response.status}`,
    );
  }
}
