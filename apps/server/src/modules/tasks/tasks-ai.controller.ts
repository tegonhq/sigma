import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ReccurenceInput } from '@tegonhq/sigma-sdk';

import { AuthGuard } from 'modules/auth/auth.guard';
import { Workspace } from 'modules/auth/session.decorator';

import TasksAIService from './tasks-ai.service';

@Controller({
  version: '1',
  path: 'tasks/ai',
})
export class TasksAIController {
  constructor(private tasksAiService: TasksAIService) {}

  @Post('recurrence')
  @UseGuards(AuthGuard)
  async aiFilters(
    @Body() reccurenceInput: ReccurenceInput,
    @Workspace() workspaceId: string,
  ) {
    return await this.tasksAiService.recurrence(reccurenceInput, workspaceId);
  }

  @Post('schedule')
  @UseGuards(AuthGuard)
  async schedule(
    @Body() reccurenceInput: ReccurenceInput,
    @Workspace() workspaceId: string,
  ) {
    return await this.tasksAiService.schedule(reccurenceInput, workspaceId);
  }

  @Post('duedate')
  @UseGuards(AuthGuard)
  async dueDate(
    @Body() reccurenceInput: ReccurenceInput,
    @Workspace() workspaceId: string,
  ) {
    return await this.tasksAiService.duedate(reccurenceInput, workspaceId);
  }
}
