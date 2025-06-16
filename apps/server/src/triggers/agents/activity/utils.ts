import { PrismaClient } from '@prisma/client';
import { UserTypeEnum } from '@redplanethq/sol-sdk';

const prisma = new PrismaClient();

/**
 * Gets the conversation for a given taskId, or creates one if it doesn't exist.
 * Returns the conversation.
 */
export const getOrCreateConversationForTask = async (taskId: string) => {
  // Try to find an existing conversation for the task
  let conversation = await prisma.conversation.findFirst({
    where: {
      taskId,
    },
  });

  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    include: {
      workspace: true,
      page: true,
    },
  });

  // If not found, create one (requires workspaceId and userId)
  if (!conversation) {
    if (!task) {
      throw new Error(
        'workspaceId and userId are required to create a conversation',
      );
    }

    conversation = await prisma.conversation.create({
      data: {
        taskId,
        workspaceId: task.workspaceId,
        userId: task.workspace.userId,
        title: `Conversation for Task ${task.page.title}`,
      },
    });
  }

  return conversation;
};

export const addConversationHistory = async (
  conversationId: string,
  activity: string,
  activityId: string,
) => {
  return await prisma.conversationHistory.create({
    data: {
      conversationId,
      message: activity,
      userType: UserTypeEnum.System,
      activityId,
    },
  });
};
