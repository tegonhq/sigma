import {
  Controller,
  Delete,
  Param,
  UseGuards,
  Post,
  Body,
  Get,
  Query,
  Put,
} from '@nestjs/common';
import {
  CreateTaskOccurenceDTO,
  GetTaskOccurenceDTO,
  UpdateTaskOccurenceDTO,
} from '@sigma/types';

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
  async createTaskOccurence(
    @Body() createTaskOccurencesData: CreateTaskOccurenceDTO,
    @Workspace() workspaceId: string,
  ) {
    return await this.taskOccurenceService.createTaskOccurence(
      createTaskOccurencesData,
      workspaceId,
    );
  }

  @Put()
  @UseGuards(AuthGuard)
  async updateTaskOccurence(
    @Body() updateTaskOccurenceDto: UpdateTaskOccurenceDTO,
    @Workspace() workspaceId: string,
  ) {
    return await this.taskOccurenceService.updateTaskOccurence(
      updateTaskOccurenceDto,
      workspaceId,
      true,
    );
  }

  @Delete()
  @UseGuards(AuthGuard)
  async deleteTaskOccurence(
    @Body('taskOccurenceIds') taskOccurenceIds: string[],
  ) {
    return await this.taskOccurenceService.deleteTaskOccurence(
      taskOccurenceIds,
      true,
    );
  }

  @Post('task')
  @UseGuards(AuthGuard)
  async createTaskOccurenceByTask(@Body('taskId') taskId: string) {
    return await this.taskOccurenceService.createTaskOccurenceByTask(taskId);
  }

  @Post('task/:taskId')
  @UseGuards(AuthGuard)
  async updateTaskOccurenceByTask(@Param('taskId') taskId: string) {
    return await this.taskOccurenceService.updateTaskOccurenceByTask(taskId);
  }

  @Delete('task/:taskId')
  @UseGuards(AuthGuard)
  async deleteTaskOccurenceByTask(@Param('taskId') taskId: string) {
    return await this.taskOccurenceService.deleteTaskOccurenceByTask(taskId);
  }
}
