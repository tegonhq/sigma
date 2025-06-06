import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Prompt, PromptInput } from '@redplanethq/sol-sdk';

import { AuthGuard } from 'modules/auth/auth.guard';
import { Workspace } from 'modules/auth/session.decorator';

import PromptsService from './prompts.service';

@Controller({
  version: '1',
  path: 'prompts',
})
export class PromptsController {
  constructor(private promptsService: PromptsService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getAllPrompts(@Workspace() workspaceId: string): Promise<Prompt[]> {
    return await this.promptsService.getAllPrompts(workspaceId);
  }

  @Post()
  @UseGuards(AuthGuard)
  async createPrompt(
    @Workspace() workspaceId: string,
    @Body() promptInput: PromptInput,
  ): Promise<Prompt> {
    return await this.promptsService.createPrompt(workspaceId, promptInput);
  }

  @Post(':promptId')
  @UseGuards(AuthGuard)
  async getPrompt(@Param('promptId') promptId: string): Promise<Prompt> {
    return await this.promptsService.getPrompt(promptId);
  }

  @Post(':promptId')
  @UseGuards(AuthGuard)
  async updatePrompt(
    @Param('promptId') promptId: string,
    @Body() promptInput: PromptInput,
  ): Promise<Prompt> {
    return await this.promptsService.updatePrompt(promptId, promptInput);
  }

  @Delete(':promptId')
  @UseGuards(AuthGuard)
  async deletePrompt(@Param('promptId') promptId: string): Promise<Prompt> {
    return await this.promptsService.deletePrompt(promptId);
  }
}
