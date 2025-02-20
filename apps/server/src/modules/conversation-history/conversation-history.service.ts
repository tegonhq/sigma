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
} from '@sigma/types';
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
      });

    if (!conversationHistory) {
      return null;
    }
    const context =
      (conversationHistory.context as ConversationContextData) || {};
    const { pages, tasks, ...otherContextData } = context;

    // Get pages data if pageIds exist
    let page: Array<Partial<Page>> = [];
    if (pages?.length) {
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
            descrition: generateHTML(
              JSON.parse(page.description),
              defaultExtensions,
            ),
          };
        }),
      );
    }

    // Get pages data if pageIds exist
    let task: Array<Partial<Task>> = [];
    if (tasks?.length) {
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
            descrition: generateHTML(
              JSON.parse(task.page.description),
              defaultExtensions,
            ),
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
