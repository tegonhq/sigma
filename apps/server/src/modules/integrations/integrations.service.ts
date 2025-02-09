import type { integrationRun } from 'triggers/integration-run';

import { Injectable } from '@nestjs/common';
import { IntegrationDefinition } from '@sigma/types';
import { tasks } from '@trigger.dev/sdk/v3';

import { LoggerService } from 'modules/logger/logger.service';
import { UsersService } from 'modules/users/users.service';

@Injectable()
export class IntegrationsService {
  private readonly logger = new LoggerService(IntegrationsService.name);

  constructor(private usersService: UsersService) {}

  async runIntegrationTrigger(
    integrationDefinition: IntegrationDefinition,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event: any,
    userId?: string,
    workspaceId?: string,
  ) {
    this.logger.info({
      message: `Loading integration ${integrationDefinition.slug}`,
      where: 'IntegrationsService.runIntegrationTrigger',
    });

    let pat = '';
    if (userId) {
      pat = await this.usersService.getOrCreatePat(userId, workspaceId);
    }

    return await tasks.trigger<typeof integrationRun>('integration-run', {
      integrationDefinition,
      pat,
      event,
    });
  }
}
