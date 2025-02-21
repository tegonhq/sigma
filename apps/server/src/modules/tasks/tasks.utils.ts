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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getCurrentTaskIds = (tiptapJson: any) => {
  const taskIds: string[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const traverseNodes = (node: any) => {
    // Check if current node is a task with an id
    if (node.type === 'task' && node.attrs?.id) {
      taskIds.push(node.attrs.id);
    }

    // Recursively traverse child nodes if they exist
    if (node.content) {
      node.content.forEach(traverseNodes);
    }
  };

  // Start traversal from the root
  traverseNodes(tiptapJson);

  return taskIds;
};
