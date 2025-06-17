import { PrismaClient } from '@prisma/client';
import { List, Page } from '@redplanethq/sol-sdk';
import { task } from '@trigger.dev/sdk/v3';
import { createActivity } from 'triggers/utils';

interface ListWithPage extends List {
  page?: Page;
}

const prisma = new PrismaClient();

/**
 * Generates a human-readable activity text for list create and delete actions.
 */
function getListActivityText(
  action: 'create' | 'delete',
  list: ListWithPage,
): string | undefined {
  const title = list.page?.title;
  const id = list.id;
  const display = title ? `${title} (${id})` : id;

  if (action === 'create') {
    return `Created list "${display}".`;
  }

  if (action === 'delete') {
    return `Deleted list "${display}".`;
  }

  return undefined;
}

export const listActivityHandler = task({
  id: 'list-activity-handler',
  queue: {
    name: 'list-activity-handler',
    concurrencyLimit: 10,
  },
  run: async (payload: {
    action: 'create' | 'delete' | 'update';
    listId: string;
  }) => {
    const { action, listId } = payload;
    const list = await prisma.list.findUnique({
      where: {
        id: listId,
      },
      include: {
        page: true,
      },
    });

    if (list.updatedBy === 'assistant') {
      return 'Created by assistant';
    }

    if (action === 'create' || action === 'delete') {
      const activityText = getListActivityText(action, list);

      if (activityText) {
        await createActivity({
          text: activityText,
          workspaceId: list.workspaceId,
        });
      }

      // You can now use activityText to create an Activity record if needed
      return { message: `Handled list ${action}`, activityText };
    }

    // For other actions, do nothing
    return { message: `No activity for action: ${action}` };
  },
});
