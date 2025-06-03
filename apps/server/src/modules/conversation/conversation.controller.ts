import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  Conversation,
  ConversationParamsDto,
  CreateConversationDto,
} from '@redplanethq/sol-sdk';

import { AuthGuard } from 'modules/auth/auth.guard';
import { CreditsGuard } from 'modules/auth/credit.guard';
import { UserId, Workspace } from 'modules/auth/session.decorator';

import { ConversationService } from './conversation.service';

@Controller({
  version: '1',
  path: 'conversation',
})
export class ConversationController {
  constructor(private conversationService: ConversationService) {}

  @Post()
  @UseGuards(AuthGuard, CreditsGuard)
  async createConversation(
    @Workspace() workspaceId: string,
    @UserId() userId: string,
    @Body() conversationData: CreateConversationDto,
  ) {
    return await this.conversationService.createConversation(
      workspaceId,
      userId,
      conversationData,
    );
  }

  @Get(':conversationId/run')
  @UseGuards(AuthGuard, CreditsGuard)
  async getConversationStream(
    @Workspace() workspaceId: string,
    @Param() conversationData: { conversationId: string },
  ) {
    return await this.conversationService.getCurrentConversationRun(
      conversationData.conversationId,
      workspaceId,
    );
  }

  @Get(':conversationId/syncs')
  @UseGuards(AuthGuard, CreditsGuard)
  async getConversationSync(
    @Workspace() workspaceId: string,
    @Param() conversationData: { conversationId: string },
  ) {
    return await this.conversationService.getConversationSyncs(
      conversationData.conversationId,
      workspaceId,
    );
  }

  @Get(':conversationId')
  @UseGuards(AuthGuard, CreditsGuard)
  async getConversation(
    @Param() conversationParams: ConversationParamsDto,
  ): Promise<Conversation> {
    return await this.conversationService.getConversation(
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

  @Post(':conversationId/read')
  @UseGuards(AuthGuard)
  async readConversation(@Param() conversationParams: ConversationParamsDto) {
    return await this.conversationService.readConversation(
      conversationParams.conversationId,
    );
  }
}
