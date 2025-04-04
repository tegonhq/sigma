import { Injectable } from '@nestjs/common';
import { Conversation, CreateConversationDto } from '@tegonhq/sigma-sdk';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) {}

  async createConversation(
    workspaceId: string,
    userId: string,
    conversationData: CreateConversationDto,
  ): Promise<Conversation> {
    const { pageId, taskId, ...otherData } = conversationData;

    return this.prisma.conversation.create({
      data: {
        workspaceId,
        userId,
        pageId,
        taskId,
        title: conversationData.message.substring(0, 100),
        ConversationHistory: {
          create: {
            userId,
            ...otherData,
          },
        },
      },
      include: {
        ConversationHistory: true,
      },
    });
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
