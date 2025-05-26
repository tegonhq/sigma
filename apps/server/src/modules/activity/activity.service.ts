import { Injectable } from '@nestjs/common';
import { convertTiptapJsonToHtml } from '@sigma/editor-extensions';
import { CreateActivityDto, UserTypeEnum } from '@tegonhq/sigma-sdk';
import { tasks } from '@trigger.dev/sdk/v3';
import { PrismaService } from 'nestjs-prisma';
import { createConversationTitle } from 'triggers/conversation/create-conversation-title';

import { UsersService } from 'modules/users/users.service';

@Injectable()
export default class ActivityService {
  constructor(
    private prisma: PrismaService,
    private users: UsersService,
  ) {}

  async createActivity(
    createActivity: CreateActivityDto,
    workspaceId: string,
    userId: string,
  ) {
    const exisitingActivity = await this.prisma.activity.findFirst({
      where: {
        sourceURL: createActivity.sourceURL,
      },
      include: {
        Conversation: true,
        integrationAccount: {
          include: {
            integrationDefinition: true,
          },
        },
      },
    });

    const conversation = exisitingActivity.Conversation[0];
    const pat = await this.users.getOrCreatePat(userId, workspaceId);

    if (exisitingActivity && conversation) {
      // Create just conversation history for the existing conversation and add a new message to that
      const integrationDefinition =
        exisitingActivity.integrationAccount?.integrationDefinition;

      const context = { agents: [integrationDefinition.slug] };

      const conversationHistory = await this.prisma.conversationHistory.create({
        data: {
          conversationId: conversation.id,
          userId,
          message: `Activity from ${integrationDefinition.name} \n Content: ${createActivity.text}`,
          userType: UserTypeEnum.User,
          context,
        },
      });

      // Trigger conversation title task
      await tasks.trigger<typeof createConversationTitle>(
        createConversationTitle.id,
        {
          conversationId: conversation.id,
          message: createActivity.text,
          pat,
        },
        { tags: [conversation.id, workspaceId] },
      );

      await tasks.trigger(
        'chat',
        {
          conversationHistoryId: conversationHistory.id,
          conversationId: conversation.id,
          autoMode: true,
          activity: exisitingActivity.id,
          context,
        },
        { tags: [conversationHistory.id, workspaceId, exisitingActivity.id] },
      );

      return exisitingActivity;
    }

    return await this.prisma.activity.create({
      data: {
        ...createActivity,
        workspaceId,
      },
    });
  }

  async runActivity(activityId: string) {
    const activity = await this.prisma.activity.findUnique({
      where: {
        id: activityId,
      },
      include: {
        workspace: true,
      },
    });
    const userContextPage = await this.prisma.page.findFirst({
      where: {
        workspaceId: activity.workspaceId,
        type: 'Context',
      },
    });

    const userContextPageHTML = userContextPage.description
      ? convertTiptapJsonToHtml(JSON.parse(userContextPage.description))
      : '';

    const pat = await this.users.getOrCreatePat(
      activity.workspace.userId,
      activity.workspaceId,
    );

    await tasks.trigger(
      'activity',
      {
        activityId,
        userContextPage: userContextPageHTML,
        pat,
      },
      { tags: [activityId, activity.workspaceId, activity.id] },
    );
  }
}
