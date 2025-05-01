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

import WorkspacesService from 'modules/workspaces/workspaces.service';

@Injectable()
export class ConversationHistoryService {
  constructor(
    private prisma: PrismaService,
    private workspace: WorkspacesService,
  ) {}

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

    const userContext = (await this.workspace.getRelevantContext(
      conversationHistory.conversation.workspaceId,
      conversationHistory.message,
      false,
    )) as string[];

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
      userContext,
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
        if (part.type && part.type === 'messages') {
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
