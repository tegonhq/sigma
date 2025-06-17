import { Injectable } from '@nestjs/common';
import {
  Conversation,
  CreateConversationDto,
  UserTypeEnum,
} from '@redplanethq/sol-sdk';
import {
  ConversationContext,
  ConversationContextData,
} from '@redplanethq/sol-sdk';
import { auth, runs, tasks } from '@trigger.dev/sdk/v3';
import { PrismaService } from 'nestjs-prisma';
import { createConversationTitle } from 'triggers/conversation/create-conversation-title';

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) {}

  async createConversation(
    workspaceId: string,
    userId: string,
    conversationData: CreateConversationDto,
  ) {
    const { pageId, title, conversationId, ...otherData } = conversationData;

    if (conversationId) {
      const conversationHistory = await this.prisma.conversationHistory.create({
        data: {
          ...otherData,
          userType: UserTypeEnum.User,
          ...(userId && {
            user: {
              connect: { id: userId },
            },
          }),
          conversation: {
            connect: { id: conversationId },
          },
        },
        include: {
          conversation: true,
        },
      });

      const context = await this.getConversationContext(conversationHistory.id);
      const handler = await tasks.trigger(
        'chat',
        {
          conversationHistoryId: conversationHistory.id,
          conversationId: conversationHistory.conversation.id,
          autoMode: true,
          context,
        },
        { tags: [conversationHistory.id, workspaceId, conversationId] },
      );

      return {
        id: handler.id,
        token: handler.publicAccessToken,
        conversationId: conversationHistory.conversation.id,
        conversationHistoryId: conversationHistory.id,
      };
    }

    const conversation = await this.prisma.conversation.create({
      data: {
        workspaceId,
        userId,
        pageId,

        title:
          title.substring(0, 100) ?? conversationData.message.substring(0, 100),
        ConversationHistory: {
          create: {
            userId,
            userType: UserTypeEnum.User,
            ...otherData,
          },
        },
      },
      include: {
        ConversationHistory: true,
      },
    });

    const conversationHistory = conversation.ConversationHistory[0];
    const context = await this.getConversationContext(conversationHistory.id);

    // Trigger conversation title task
    await tasks.trigger<typeof createConversationTitle>(
      createConversationTitle.id,
      {
        conversationId: conversation.id,
        message: conversationData.message,
      },
      { tags: [conversation.id, workspaceId] },
    );

    const handler = await tasks.trigger(
      'chat',
      {
        conversationHistoryId: conversationHistory.id,
        conversationId: conversation.id,
        autoMode: true,
        context,
      },
      { tags: [conversationHistory.id, workspaceId, conversation.id] },
    );

    return {
      id: handler.id,
      token: handler.publicAccessToken,
      conversationId: conversation.id,
      conversationHistoryId: conversationHistory.id,
    };
  }

  async getConversationContext(
    conversationHistoryId: string,
  ): Promise<ConversationContext> {
    const conversationHistory =
      await this.prisma.conversationHistory.findUnique({
        where: { id: conversationHistoryId },
        include: { conversation: true },
      });

    if (!conversationHistory) {
      return null;
    }
    const context =
      (conversationHistory.context as ConversationContextData) || {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { agents = [], ...otherContextData } = context;

    // Get previous conversation history message and response
    let previousHistory = null;
    if (conversationHistory.conversationId) {
      previousHistory = await this.prisma.conversationHistory.findMany({
        where: {
          conversationId: conversationHistory.conversationId,
          id: {
            not: conversationHistoryId,
          },
          deleted: null,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
    }

    return {
      previousHistory,
      agents: [],
      ...otherContextData,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }

  async getCurrentConversationRun(conversationId: string, workspaceId: string) {
    const conversationHistory = await this.prisma.conversationHistory.findFirst(
      {
        where: {
          conversationId,
          conversation: {
            workspaceId,
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      },
    );

    const response = await runs.list({
      tag: [conversationId, conversationHistory.id],
      status: ['QUEUED', 'EXECUTING'],
      limit: 1,
    });

    const run = response.data[0];
    if (!run) {
      return undefined;
    }

    const publicToken = await auth.createPublicToken({
      scopes: {
        read: {
          runs: [run.id],
        },
      },
    });

    return {
      id: run.id,
      token: publicToken,
      conversationId,
      conversationHistoryId: conversationHistory.id,
    };
  }

  async getConversation(conversationId: string): Promise<Conversation> {
    return this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
  }

  async deleteConversation(conversationId: string): Promise<Conversation> {
    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        deleted: new Date().toISOString(),
      },
    });
  }

  async readConversation(conversationId: string): Promise<Conversation> {
    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { unread: false },
    });
  }

  async getConversationSyncs(conversationId: string, workspaceId: string) {
    return this.prisma.sync.findMany({
      where: {
        conversationId,
        workspaceId,
      },
    });
  }
}
