import { Injectable } from '@nestjs/common';
import {
  Conversation,
  CreateConversationDto,
  UpdateConversationDto,
} from '@sigma/types';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) {}

  async createConversation(
    conversationData: CreateConversationDto,
  ): Promise<Conversation> {
    return this.prisma.conversation.create({
      data: {
        ...conversationData,
      },
    });
  }

  async updateConversation(
    updateConversationData: UpdateConversationDto,
    conversationId: string,
  ): Promise<Conversation> {
    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        ...updateConversationData,
      },
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
