import {
  Controller,
  Delete,
  Param,
  UseGuards,
  Post,
  Body,
  Get,
  Query,
} from '@nestjs/common';
import { GetTaskOccurenceDTO, UpdateTaskOccurenceDTO } from '@sigma/types';

import { AuthGuard } from 'modules/auth/auth.guard';
import { Workspace } from 'modules/auth/session.decorator';

import { TaskOccurenceService } from './task-occurence.service';

@Controller({
  version: '1',
  path: 'task-occurence',
})
export class TaskOccurenceController {
  constructor(private taskOccurenceService: TaskOccurenceService) {}

  @Get('filter')
  @UseGuards(AuthGuard)
  async getTaskOccurences(
    @Query() query: GetTaskOccurenceDTO,
    @Workspace() workspaceId: string,
  ) {
    return await this.taskOccurenceService.getTaskOccurences(
      workspaceId,
      query,
    );
  }

  @Get(':taskOccurenceId')
  @UseGuards(AuthGuard)
  async getTaskOccurence(@Param('taskOccurenceId') taskOccurenceId: string) {
    return await this.taskOccurenceService.getTaskOccurence(taskOccurenceId);
  }

  @Post()
  @UseGuards(AuthGuard)
  async createTaskOccurence(@Body('taskId') taskId: string) {
    return await this.taskOccurenceService.createTaskOccurance(taskId);
  }

  @Post('task/:taskId')
  @UseGuards(AuthGuard)
  async updateTaskOccurenceByTask(@Param('taskId') taskId: string) {
    return await this.taskOccurenceService.updateTaskOccuranceByTask(taskId);
  }

  @Post(':taskOccurenceId')
  @UseGuards(AuthGuard)
  async updateTaskOccurence(
    @Param('taskOccurenceId') taskOccurenceId: string,
    @Body() updateTaskOccurenceDto: UpdateTaskOccurenceDTO,
  ) {
    return await this.taskOccurenceService.updateTaskOccurance(
      taskOccurenceId,
      updateTaskOccurenceDto,
    );
  }

  @Delete('task/:taskId')
  @UseGuards(AuthGuard)
  async deleteTaskOccurenceByTask(@Param('taskId') taskId: string) {
    return await this.taskOccurenceService.deleteTaskOccuranceByTask(taskId);
  }

  @Delete(':taskOccurenceId')
  @UseGuards(AuthGuard)
  async deleteTaskOccurence(@Param('taskOccurenceId') taskOccurenceId: string) {
    return await this.taskOccurenceService.deleteTaskOccurence(taskOccurenceId);
  }
}
