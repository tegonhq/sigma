import { PrismaClient } from '@prisma/client';
import { Page } from '@redplanethq/sol-sdk';
import { task } from '@trigger.dev/sdk/v3';
import { createActivity } from 'triggers/utils';

const prisma = new PrismaClient();

/**
 * Generates a human-readable activity text for page title changes,
 * specifically for tasks and lists.
 */
async function getPageActivityTextForUpdate(
  page: Page,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  changeData?: Record<string, { oldValue: any; newValue: any }>,
): Promise<string | undefined> {
  if (!changeData || !changeData.title) {
    return undefined;
  }

  // Try to find a task with this pageId
  const task = await prisma.task.findFirst({
    where: { pageId: page.id },
  });

  if (task) {
    return `Task title changed from "${changeData.title.oldValue}" to "${changeData.title.newValue}" (Task ID: ${task.id})`;
  }

  // Try to find a list with this pageId
  const list = await prisma.list.findFirst({
    where: { pageId: page.id },
  });

  if (list) {
    return `List title changed from "${changeData.title.oldValue}" to "${changeData.title.newValue}" (List ID: ${list.id})`;
  }

  // If neither, return undefined
  return undefined;
}

export const pageActivityHandler = task({
  id: 'page-activity-handler',
  queue: {
    name: 'page-activity-handler',
    concurrencyLimit: 10,
  },
  run: async (payload: {
    action: 'create' | 'update' | 'delete';
    page: Page;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    changeData?: Record<string, { oldValue: any; newValue: any }>;
  }) => {
    const { action, page, changeData } = payload;

    if (action === 'update') {
      // Try to find a task or list with this pageId in parallel
      const [task, list] = await Promise.all([
        prisma.task.findFirst({ where: { pageId: page.id } }),
        prisma.list.findFirst({ where: { pageId: page.id } }),
      ]);

      // If task exists and was updated by assistant, skip
      if (task && task.updatedBy === 'assistant') {
        return 'Updated by assistant';
      }

      // If list exists and was updated by assistant, skip
      if (list && list.updatedBy === 'assistant') {
        return 'Updated by assistant';
      }

      const activityText = await getPageActivityTextForUpdate(page, changeData);

      if (activityText) {
        await createActivity({
          text: activityText,
          workspaceId: page.workspaceId,
          taskId: task?.id,
        });
      }

      return { message: 'Handled page update', activityText };
    }

    // For create/delete, do nothing
    return { message: `No activity for action: ${action}` };
  },
});
