import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ConversationHistory,
  ConversationHistoryParamsDto,
  ConversationParamsDto,
  CreateConversationHistoryDto,
  UpdateConversationHistoryDto,
} from '@tegonhq/sigma-sdk';
import { Response } from 'express';

import { AuthGuard } from 'modules/auth/auth.guard';

import { ConversationHistoryService } from './conversation-history.service';

@Controller({
  version: '1',
  path: 'conversation_history',
})
export class ConversationHistoryController {
  constructor(private conversationHistoryService: ConversationHistoryService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createConversationHistory(
    @Body() conversationHistoryData: CreateConversationHistoryDto,
  ): Promise<ConversationHistory> {
    return await this.conversationHistoryService.createConversationHistory(
      conversationHistoryData,
    );
  }

  @Get(':conversationHistoryId/stream')
  @UseGuards(AuthGuard)
  async streamConversationHistory(
    @Param() params: ConversationHistoryParamsDto,
    @Res() response: Response,
  ) {
    return this.conversationHistoryService.streamConversation(
      params.conversationHistoryId,
      response,
    );
  }

  @Post(':conversationHistoryId')
  @UseGuards(AuthGuard)
  async updateConversationHistory(
    @Param() params: ConversationHistoryParamsDto,
    @Body() conversationHistoryData: UpdateConversationHistoryDto,
  ): Promise<ConversationHistory> {
    return await this.conversationHistoryService.updateConversationHistory(
      conversationHistoryData,
      params.conversationHistoryId,
    );
  }

  @Delete(':conversationHistoryId')
  @UseGuards(AuthGuard)
  async deleteConversationHistory(
    @Param() params: ConversationHistoryParamsDto,
  ): Promise<ConversationHistory> {
    return await this.conversationHistoryService.deleteConversationHistory(
      params.conversationHistoryId,
    );
  }

  @Get()
  @UseGuards(AuthGuard)
  async getAllConversationHistory(
    @Param() conversationParams: ConversationParamsDto,
  ): Promise<ConversationHistory[]> {
    return await this.conversationHistoryService.getAllConversationHistory(
      conversationParams.conversationId,
    );
  }

  @Get(':conversationHistoryId')
  @UseGuards(AuthGuard)
  async getConversationHistory(
    @Param() params: ConversationHistoryParamsDto,
  ): Promise<ConversationHistory> {
    return await this.conversationHistoryService.getConversationHistory(
      params.conversationHistoryId,
    );
  }

  @Get(':conversationHistoryId/action/:actionId')
  @UseGuards(AuthGuard)
  async getConversationHistoryForAction(
    @Param() params: { conversationHistoryId: string; actionId: string },
  ) {
    return await this.conversationHistoryService.getConversationHistoryForAction(
      params,
    );
  }
}
