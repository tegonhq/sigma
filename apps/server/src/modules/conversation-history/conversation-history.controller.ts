import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  CreatePageDto,
  Page,
  PageRequestParamsDto,
  UpdatePageDto,
} from '@sigma/types';

import { AuthGuard } from 'modules/auth/auth.guard';
import { Workspace } from 'modules/auth/session.decorator';

import { ConversationService } from './conversation-history.service';

@Controller({
  version: '1',
  path: 'conversation_history',
})
export class ConversationController {
  constructor(private conversationService: ConversationService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createConversation(
    @Workspace() workspaceId: string,
    @Body() pageData: CreatePageDto,
  ): Promise<Page> {
    return await this.conversationService.createPage(pageData, workspaceId);
  }

  @Post(':pageId')
  @UseGuards(AuthGuard)
  async updateIssue(
    @Param() pageParams: PageRequestParamsDto,
    @Body() pageData: UpdatePageDto,
  ): Promise<Page> {
    return await this.conversationService.updatePage(
      pageData,
      pageParams.pageId,
    );
  }

  @Delete(':pageId')
  @UseGuards(AuthGuard)
  async deletePage(@Param() pageParams: PageRequestParamsDto): Promise<Page> {
    return await this.conversationService.deletePage(pageParams.pageId);
  }
}
