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
import { runs, tasks } from '@trigger.dev/sdk/v3';
import { Response } from 'express';
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

  async streamConversation(conversationHistoryId: string, response: Response) {
    const conversationHistory =
      await this.prisma.conversationHistory.findUnique({
        where: {
          id: conversationHistoryId,
        },
        include: {
          conversation: true,
        },
      });

    if (!conversationHistory) {
      response.status(404).send('Conversation history not found');
      return;
    }

    // Set up proper headers for streaming
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');

    // Pass the task type to `trigger()` as a generic argument, giving you full type checking
    const { id } = await tasks.trigger(
      'chat',
      {
        conversationHistoryId,
        conversationId: conversationHistory.conversation.id,
        autoMode: true,
      },
      { tags: [conversationHistoryId] },
    );

    try {
      // Use a for-await loop to subscribe to the stream
      for await (const part of runs.subscribeToRun(id).withStreams()) {
        // Check for terminal run statuses to end the stream appropriately
        if (
          [
            'COMPLETED',
            'CANCELED',
            'FAILED',
            'CRASHED',
            'INTERRUPTED',
            'SYSTEM_FAILURE',
            'EXPIRED',
            'TIMED_OUT',
          ].includes(part.run.status)
        ) {
          // Send final data if it's a completion
          if (part.run.status === 'COMPLETED' && part.type === 'run') {
          } else if (part.run.status !== 'COMPLETED') {
          }
          break;
        }

        // Process stream data
        if (part.type && part.type.includes('messages')) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          response.write(`data: ${JSON.stringify((part as any).chunk)}\n\n`);
        }
      }
    } catch (e) {
      // Send error information when an exception occurs
      response.write(
        `data: ${JSON.stringify({
          status: 'error',
          error: e instanceof Error ? e.message : 'Unknown error',
        })}\n\n`,
      );
      response.end();
      return;
    }

    response.end();
  }
}
