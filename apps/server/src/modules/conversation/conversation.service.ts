import { Injectable } from '@nestjs/common';
import { defaultExtensions } from '@sigma/editor-extensions';
import {
  Conversation,
  CreateConversationDto,
  UserTypeEnum,
} from '@tegonhq/sigma-sdk';
import {
  ConversationContext,
  ConversationContextData,
  Page,
  Task,
} from '@tegonhq/sigma-sdk';
import { generateHTML } from '@tiptap/html';
import { auth, runs, tasks } from '@trigger.dev/sdk/v3';
import { PrismaService } from 'nestjs-prisma';
import { createConversationTitle } from 'triggers/conversation/create-conversation-title';

import { UsersService } from 'modules/users/users.service';

@Injectable()
export class ConversationService {
  constructor(
    private prisma: PrismaService,
    private users: UsersService,
  ) {}

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

    const pat = await this.users.getOrCreatePat(userId, workspaceId);

    // Trigger conversation title task
    await tasks.trigger<typeof createConversationTitle>(
      createConversationTitle.id,
      {
        conversationId: conversation.id,
        message: conversationData.message,
        pat,
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
    const { pages, tasks, agents = [], ...otherContextData } = context;

    // Add page/task from conversation if they exist
    if (conversationHistory.conversation.pageId) {
      if (!context.pages) {
        context.pages = [];
      }

      if (!context.pages.includes(conversationHistory.conversation.pageId)) {
        context.pages.push(conversationHistory.conversation.pageId);
      }
    }

    // Get pages data if pageIds exist
    let page: Array<Partial<Page>> = [];
    if (context.pages?.length) {
      page = await Promise.all(
        context.pages.map(async (pageId: string) => {
          const page = await this.prisma.page.findUnique({
            where: {
              id: pageId,
            },
          });

          const pageData: Record<string, string> = {
            title: page.title,
            id: page.id,
            descrition: page.description
              ? generateHTML(JSON.parse(page.description), defaultExtensions)
              : undefined,
            type: page.type,
          };

          // If page type is List, fetch the list and add listId
          if (page.type === 'List') {
            const list = await this.prisma.list.findFirst({
              where: {
                pageId: page.id,
              },
            });
            if (list) {
              pageData['listId'] = list.id;
            }
          }

          // If page type is Default, fetch tasks for that page and add taskId
          if (page.type === 'Default') {
            const task = await this.prisma.task.findFirst({
              where: {
                pageId: page.id,
              },
            });
            if (task) {
              pageData['taskId'] = task.id;
            }
          }

          return pageData;
        }),
      );
    }

    // Get pages data if pageIds exist
    // eslint-disable-next-line prefer-const
    let task: Array<Partial<Task>> = [];

    // Get previous conversation history message and response
    let previousHistory = null;
    const uniqueAgents = new Set(agents);
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

      // Add agents from previous conversations to uniqueAgents set
      previousHistory.forEach((history) => {
        const historyContext = history.context as ConversationContextData;
        if (historyContext?.agents?.length) {
          historyContext.agents.forEach((agent) => uniqueAgents.add(agent));
        }
      });
    }

    return {
      page,
      task,
      previousHistory,
      agents: Array.from(uniqueAgents),
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
