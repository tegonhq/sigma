import { Injectable } from '@nestjs/common';
import { CreateActivityDto, UserTypeEnum } from '@tegonhq/sigma-sdk';
import { tasks } from '@trigger.dev/sdk/v3';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export default class ActivityService {
  constructor(private prisma: PrismaService) {}

  async createActivity(
    createActivity: CreateActivityDto,
    workspaceId: string,
    userId: string,
  ) {
    const exisitingActivity = await this.prisma.activity.findFirst({
      where: {
        sourceId: createActivity.sourceId,
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

    if (exisitingActivity) {
      // Create just conversation history for the existing conversation and add a new message to that
      const conversation = exisitingActivity.Conversation[0];
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
      where: { id: activityId },
      include: {
        integrationAccount: {
          include: {
            integrationDefinition: true,
          },
        },
      },
    });

    const integrationDefinition =
      activity.integrationAccount?.integrationDefinition;

    const workspace = await this.prisma.workspace.findFirst({
      where: { id: activity.workspaceId },
    });

    const context = { agents: [integrationDefinition.slug] };
    const conversation = await this.prisma.conversation.create({
      data: {
        workspaceId: activity.workspaceId,
        userId: workspace.userId,
        activityId: activity.id,
        title: activity.text.substring(0, 100),
        ConversationHistory: {
          create: {
            userId: workspace.userId,
            message: `Activity from ${integrationDefinition.name} \n Content: ${activity.text}`,
            userType: UserTypeEnum.User,
            context,
          },
        },
      },
      include: {
        ConversationHistory: true,
      },
    });

    const conversationHistory = conversation.ConversationHistory[0];

    await tasks.trigger(
      'chat',
      {
        conversationHistoryId: conversationHistory.id,
        conversationId: conversation.id,
        autoMode: true,
        activity: activity.id,
        context,
      },
      { tags: [conversationHistory.id, activity.workspaceId, activity.id] },
    );
  }
}
