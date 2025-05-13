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
import { tasks } from '@trigger.dev/sdk/v3';
import { PrismaService } from 'nestjs-prisma';

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
        { tags: [conversationHistory.id] },
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

    const handler = await tasks.trigger(
      'chat',
      {
        conversationHistoryId: conversationHistory.id,
        conversationId: conversation.id,
        autoMode: true,
        context,
      },
      { tags: [conversationHistory.id] },
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
    const { pages, tasks, ...otherContextData } = context;

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
      page,
      task,
      previousHistory,
      ...otherContextData,
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
}
