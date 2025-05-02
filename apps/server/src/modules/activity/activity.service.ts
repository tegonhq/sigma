import { Injectable } from '@nestjs/common';
import { UserTypeEnum } from '@tegonhq/sigma-sdk';
import { tasks } from '@trigger.dev/sdk/v3';
import { PrismaService } from 'nestjs-prisma';

import WorkspacesService from 'modules/workspaces/workspaces.service';

@Injectable()
export default class ActivityService {
  constructor(
    private prisma: PrismaService,
    private workspace: WorkspacesService,
  ) {}

  async runActivity(activityId: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
    });

    const workspace = await this.prisma.workspace.findFirst({
      where: { id: activity.workspaceId },
    });

    const conversation = await this.prisma.conversation.create({
      data: {
        workspaceId: activity.workspaceId,
        userId: workspace.userId,
        activityId: activity.id,
        title: activity.text.substring(0, 100),
        ConversationHistory: {
          create: {
            userId: workspace.userId,
            message: `Activity: ${activity.text}`,
            userType: UserTypeEnum.User,
          },
        },
      },
      include: {
        ConversationHistory: true,
      },
    });

    const conversationHistory = conversation.ConversationHistory[0];
    const userContext = (await this.workspace.getRelevantContext(
      conversation.workspaceId,
      conversationHistory.message,
      false,
    )) as string[];

    if (userContext.length === 0) {
      return;
    }

    await tasks.trigger(
      'chat',
      {
        conversationHistoryId: conversationHistory.id,
        conversationId: conversation.id,
        autoMode: true,
        activity: activity.id,
        context: {
          userContext,
        },
      },
      { tags: [conversationHistory.id, activity.workspaceId, activity.id] },
    );
  }
}
