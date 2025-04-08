import { Injectable } from '@nestjs/common';
import { defaultExtensions } from '@sigma/editor-extensions';
import {
  ConversationContext,
  ConversationContextData,
  ConversationHistory,
  CreateConversationHistoryDto,
  Page,
  Task,
  UpdateConversationHistoryDto,
} from '@tegonhq/sigma-sdk';
import { generateHTML } from '@tiptap/html';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class ConversationHistoryService {
  constructor(private prisma: PrismaService) {}

  async createConversationHistory(
    conversationHistoryData: CreateConversationHistoryDto,
  ): Promise<ConversationHistory> {
    const { conversationId, userId, ...otherData } = conversationHistoryData;
    return this.prisma.conversationHistory.create({
      data: {
        ...otherData,
        ...(userId && {
          user: {
            connect: { id: userId },
          },
        }),
        conversation: {
          connect: { id: conversationId },
        },
      },
    });
  }

  async updateConversationHistory(
    conversationHistoryData: UpdateConversationHistoryDto,
    conversationHistoryId: string,
  ): Promise<ConversationHistory> {
    return this.prisma.conversationHistory.update({
      where: { id: conversationHistoryId },
      data: conversationHistoryData,
    });
  }

  async deleteConversationHistory(
    conversationHistoryId: string,
  ): Promise<ConversationHistory> {
    return this.prisma.conversationHistory.update({
      where: { id: conversationHistoryId },
      data: {
        deleted: new Date(),
      },
    });
  }

  async getConversationHistory(
    conversationHistoryId: string,
  ): Promise<ConversationHistory> {
    return this.prisma.conversationHistory.findUnique({
      where: {
        id: conversationHistoryId,
      },
    });
  }

  async getAllConversationHistory(
    conversationId: string,
  ): Promise<ConversationHistory[]> {
    return this.prisma.conversationHistory.findMany({
      where: {
        conversationId,
        deleted: null,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
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

    if (conversationHistory.conversation.taskId) {
      if (!context.tasks) {
        context.tasks = [];
      }
      if (!context.tasks.includes(conversationHistory.conversation.taskId)) {
        context.tasks.push(conversationHistory.conversation.taskId);
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

          return {
            title: page.title,
            id: page.id,
            descrition: page.description
              ? generateHTML(JSON.parse(page.description), defaultExtensions)
              : undefined,
          };
        }),
      );
    }

    // Get pages data if pageIds exist
    let task: Array<Partial<Task>> = [];
    if (context.tasks?.length) {
      task = await Promise.all(
        context.tasks.map(async (taskId: string) => {
          const task = await this.prisma.task.findUnique({
            where: {
              id: taskId,
            },
            include: {
              page: true,
            },
          });

          return {
            title: task.page.title,
            id: task.id,
            descrition: task.page.description
              ? generateHTML(
                  JSON.parse(task.page.description),
                  defaultExtensions,
                )
              : undefined,
          };
        }),
      );
    }

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
}
