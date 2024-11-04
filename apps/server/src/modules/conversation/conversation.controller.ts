import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  Conversation,
  ConversationParamsDto,
  CreateConversationDto,
  Page,
  UpdateConversationDto,
} from '@sigma/types';

import { AuthGuard } from 'modules/auth/auth.guard';
import { Workspace } from 'modules/auth/session.decorator';

import { ConversationService } from './conversation.service';

@Controller({
  version: '1',
  path: 'conversations',
})
export class ConversationController {
  constructor(private conversationService: ConversationService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createConversation(
    @Workspace() workspaceId: string,
    @Body() conversationData: CreateConversationDto,
  ): Promise<Page> {
    return await this.conversationService.createConversation(
      conversationData,
      workspaceId,
    );
  }

  @Post(':conversationId')
  @UseGuards(AuthGuard)
  async updateConversation(
    @Param() conversationParams: ConversationParamsDto,
    @Body() conversationData: UpdateConversationDto,
  ): Promise<Conversation> {
    return await this.conversationService.updateConversation(
      conversationData,
      conversationParams.conversationId,
    );
  }

  @Delete(':conversationId')
  @UseGuards(AuthGuard)
  async deleteConversation(
    @Param() conversationParams: ConversationParamsDto,
  ): Promise<Conversation> {
    return await this.conversationService.deleteConversation(
      conversationParams.conversationId,
    );
  }
}
