import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CreateTaskDto, UnifiedSearchOptionsDto } from '@redplanethq/sol-sdk';

import { AuthGuard } from 'modules/auth/auth.guard';
import { UpdatedBy, UserId, Workspace } from 'modules/auth/session.decorator';

import { TaskVectorService } from './tasks-vector.service';
import { TasksService } from './tasks.service';

@Controller({
  version: '1',
  path: 'tasks',
})
export class TasksController {
  constructor(
    private tasksService: TasksService,
    private tasksVectorService: TaskVectorService,
  ) {}

  @Get('search')
  @UseGuards(AuthGuard)
  async searchTasks(
    @Query() searchOptions: UnifiedSearchOptionsDto,
    @Workspace() workspaceId: string,
  ) {
    return await this.tasksVectorService.searchTasks(
      workspaceId,
      searchOptions,
    );
  }

  @Get(':taskId')
  @UseGuards(AuthGuard)
  async getTaskById(@Param('taskId') taskId: string) {
    return await this.tasksService.getTaskById(taskId);
  }

  @Get('source/:sourceURL')
  @UseGuards(AuthGuard)
  async getTaskBySource(
    @Param('sourceURL') sourceURL: string,
    @Workspace() workspaceId: string,
  ) {
    return await this.tasksService.getTaskBySourceURL(sourceURL, workspaceId);
  }

  @Post()
  @UseGuards(AuthGuard)
  async createTask(
    @Workspace() workspaceId: string,
    @Body() taskData: CreateTaskDto,
    @UpdatedBy() updatedBy: string,
  ) {
    return await this.tasksService.createTask(taskData, workspaceId, updatedBy);
  }

  @Post('source')
  @UseGuards(AuthGuard)
  async upsertTaskBySource(
    @Workspace() workspaceId: string,
    @Body() taskData: CreateTaskDto,
  ) {
    return await this.tasksService.upsertTaskBySource(taskData, workspaceId);
  }

  @Post(':taskId')
  @UseGuards(AuthGuard)
  async updateTask(
    @Param('taskId') taskId: string,
    @Body() taskData: Partial<CreateTaskDto>,
    @UpdatedBy() updatedBy: string,
  ) {
    return await this.tasksService.updateTask(taskId, taskData, updatedBy);
  }

  @Delete(':taskId')
  @UseGuards(AuthGuard)
  async deleteTask(
    @Param('taskId') taskId: string,
    @UpdatedBy() updatedBy: string,
  ) {
    return await this.tasksService.deleteTask(taskId, updatedBy);
  }

  @Delete('source/:sourceURL')
  @UseGuards(AuthGuard)
  async deleteTaskBySourceId(
    @Param('sourceURL') sourceURL: string,
    @Workspace() workspaceId: string,
    @UserId() userId: string,
  ) {
    return await this.tasksService.deleteTaskBySourceURL(
      sourceURL,
      workspaceId,
      userId,
    );
  }
}
