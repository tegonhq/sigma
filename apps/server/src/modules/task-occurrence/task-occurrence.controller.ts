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
  CreateTaskOccurrenceDTO,
  GetTaskOccurrenceDTO,
  UpdateTaskOccurenceDTO,
} from '@sigma/types';

import { AuthGuard } from 'modules/auth/auth.guard';
import { Workspace } from 'modules/auth/session.decorator';

import { TaskOccurenceService } from './task-occurrence.service';

@Controller({
  version: '1',
  path: 'task-occurrence',
})
export class TaskOccurenceController {
  constructor(private taskOccurenceService: TaskOccurenceService) {}

  @Get('filter')
  @UseGuards(AuthGuard)
  async getTaskOccurences(
    @Query() query: GetTaskOccurrenceDTO,
    @Workspace() workspaceId: string,
  ) {
    return await this.taskOccurenceService.getTaskOccurences(
      workspaceId,
      query,
    );
  }

  @Get(':taskOccurrenceId')
  @UseGuards(AuthGuard)
  async getTaskOccurence(@Param('taskOccurrenceId') taskOccurrenceId: string) {
    return await this.taskOccurenceService.getTaskOccurence(taskOccurrenceId);
  }

  @Post(':taskOccurrenceId')
  @UseGuards(AuthGuard)
  async updateSingleTaskOccurrence(
    @Param('taskOccurrenceId') taskOccurrenceId: string,
    @Body() updateTaskOccurenceDto: Partial<UpdateTaskOccurenceDTO>,
    @Workspace() workspaceId: string,
  ) {
    return await this.taskOccurenceService.updateSingleTaskOccurrence(
      taskOccurrenceId,
      updateTaskOccurenceDto,
      workspaceId,
    );
  }

  @Post()
  @UseGuards(AuthGuard)
  async createTaskOccurence(
    @Body() createTaskOccurencesData: CreateTaskOccurrenceDTO,
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
    @Query('taskOccurrenceIds') taskOccurrenceIdsString: string,
  ) {
    const taskOccurrenceIds = taskOccurrenceIdsString.split(',');

    return await this.taskOccurenceService.deleteTaskOccurence(
      taskOccurrenceIds,
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
