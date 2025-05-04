import { PrismaClient } from '@prisma/client';
import { IntegrationPayloadEventType } from '@tegonhq/sigma-sdk';
import { logger, schedules, tasks } from '@trigger.dev/sdk/v3';

import { integrationRun } from './integration-run';

const prisma = new PrismaClient();

export const integrationRunSchedule = schedules.task({
  id: 'integration-run-schedule',
  run: async (payload) => {
    const { externalId } = payload;
    const integrationAccount = await prisma.integrationAccount.findUnique({
      where: { id: externalId },
      include: {
        integrationDefinition: true,
        workspace: true,
      },
    });

    if (!integrationAccount) {
      const deletedSchedule = await schedules.del(externalId);
      logger.info('Deleting schedule as integration account is not there');
      return deletedSchedule;
    }

    const pat = await prisma.personalAccessToken.findFirst({
      where: { userId: integrationAccount.workspace.userId, name: 'default' },
    });

    return await tasks.trigger<typeof integrationRun>('integration-run', {
      event: IntegrationPayloadEventType.SCHEDULED_SYNC,
      pat: pat.token,
      integrationAccount,
      integrationDefinition: integrationAccount.integrationDefinition,
    });
  },
});
