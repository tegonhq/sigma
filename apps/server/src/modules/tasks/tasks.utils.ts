import { IntegrationPayloadEventType, Task } from '@sigma/types';
import { PrismaService } from 'nestjs-prisma';

import { IntegrationsService } from 'modules/integrations/integrations.service';

export async function handleCalendarTask(
  prisma: PrismaService,
  integrationsService: IntegrationsService,
  workspaceId: string,
  userId: string,
  type: string,
  task: Task,
) {
  const integrationAccount = await prisma.integrationAccount.findFirst({
    where: {
      integrationDefinition: { slug: 'google-calendar' },
      deleted: null,
      workspaceId,
    },
    include: {
      integrationDefinition: true,
    },
  });

  if (!integrationAccount) {
    return undefined;
  }

  return await integrationsService.runIntegrationTrigger(
    integrationAccount.integrationDefinition,
    {
      event: IntegrationPayloadEventType.TASK,
      eventBody: {
        integrationAccount,
        type,
        task,
      },
    },
    userId,
    workspaceId,
  );
}
