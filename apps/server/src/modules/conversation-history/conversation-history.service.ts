import { Injectable } from '@nestjs/common';
import {
  Activity,
  ConversationContext,
  ConversationContextIds,
  ConversationHistory,
  CreateConversationHistoryDto,
  Page,
  UpdateConversationHistoryDto,
} from '@sigma/types';
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
      (conversationHistory.context as ConversationContextIds) || {};
    // Get pages data if pageIds exist
    let page: Page[] = [];
    if (context?.pages?.length) {
      page = await Promise.all(
        context.pages.map(async (pageContext) => {
          const page = await this.prisma.page.findUnique({
            where: {
              id: pageContext.id,
            },
          });

          if (page && pageContext.location?.length) {
            // Split content into lines and get specified ranges
            const lines = page.description?.split('\n') || [];
            const selectedLines = pageContext.location.map((loc) => {
              const [start, end] = loc.split(':').map(Number);
              return lines.slice(start - 1, end).join('\n');
            });
            page.description = selectedLines.join('\n');
          }

          return page;
        }),
      );
    }

    // Get activities data if activityIds exist
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let activity: Activity[] = [];
    if (context?.activityIds?.length) {
      activity = await this.prisma.activity.findMany({
        where: {
          id: {
            in: context.activityIds,
          },
        },
      });
    }

    // Get previous conversation history message and response
    let previousHistory = null;
    if (conversationHistory.conversationId) {
      const previousMessages = await this.prisma.conversationHistory.findMany({
        where: {
          conversationId: conversationHistory.conversationId,
          id: {
            not: conversationHistoryId,
          },
          deleted: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      });

      if (previousMessages.length > 0) {
        previousHistory = previousMessages.slice(0, 2);
      }
    }

    console.log({ page, activity, previousHistory });
    return {
      page,
      activity,
      previousHistory,
    };
  }
}
