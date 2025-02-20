import { PrismaClient } from '@prisma/client';
import { convertTiptapJsonToHtml } from '@sigma/editor-extensions';
import { IntegrationPayloadEventType, Task } from '@sigma/types';

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

export function getTaskContent(task: Task) {
  let body = '';
  if (task.page?.description) {
    const descriptionJson = JSON.parse(task.page.description);
    body = convertTiptapJsonToHtml(descriptionJson);
  }
  return {
    title: task.page.title,
    body,
    state: task.status,
    startTime: task.startTime,
    endTime: task.endTime,
    recurrence: task.recurrence,
    scheduleText: task.scheduleText,
    dueDate: task.dueDate,
    remindAt: task.remindAt,
    tags: task.tags,
  };
}

export function getSummaryData(task: Task, isCreate: boolean) {
  return {
    type: 'task',
    action: isCreate ? 'create' : 'update',
    content: getTaskContent(task),
    metadata: {
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    },
  };
}
