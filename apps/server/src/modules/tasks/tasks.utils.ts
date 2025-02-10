import { PrismaClient } from '@prisma/client';
import {
  CreateActivityDto,
  IntegrationPayloadEventType,
  Task,
} from '@sigma/types';

import { IntegrationsService } from 'modules/integrations/integrations.service';

export type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;
export async function handleCalendarTask(
  prisma: TransactionClient,
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

export function transformActivityDto(
  dto: CreateActivityDto,
  workspaceId: string,
) {
  return {
    type: dto.type,
    eventData: dto.eventData,
    name: dto.name,
    integrationAccount: {
      connect: {
        id: dto.integrationAccountId,
      },
    },
    workspace: {
      connect: {
        id: workspaceId,
      },
    },
  };
}
