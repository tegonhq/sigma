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
import { CreateTaskDto, Task } from '@tegonhq/sigma-sdk';

import { AuthGuard } from 'modules/auth/auth.guard';
import { UserId, Workspace } from 'modules/auth/session.decorator';

import { TasksService } from './tasks.service';

@Controller({
  version: '1',
  path: 'tasks',
})
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get('search')
  @UseGuards(AuthGuard)
  async searchTasks(
    @Query('query') query: string,
    @Workspace() workspaceId: string,
  ): Promise<Task[]> {
    return await this.tasksService.searchTasks(query, workspaceId);
  }

  @Get(':taskId')
  @UseGuards(AuthGuard)
  async getTaskById(@Param('taskId') taskId: string): Promise<Task> {
    return await this.tasksService.getTaskById(taskId);
  }

  @Get('source/:sourceId')
  @UseGuards(AuthGuard)
  async getTaskBySource(
    @Param('sourceId') sourceId: string,
    @Workspace() workspaceId: string,
  ): Promise<Task> {
    return await this.tasksService.getTaskBySourceId(sourceId, workspaceId);
  }

  @Post()
  @UseGuards(AuthGuard)
  async createTask(
    @Workspace() workspaceId: string,
    @Body() taskData: CreateTaskDto,
  ): Promise<Task> {
    return await this.tasksService.createTask(taskData, workspaceId);
  }

  @Post('source')
  @UseGuards(AuthGuard)
  async upsertTaskBySource(
    @Workspace() workspaceId: string,
    @Body() taskData: CreateTaskDto,
  ): Promise<Task> {
    return await this.tasksService.upsertTaskBySource(taskData, workspaceId);
  }

  @Post(':taskId')
  @UseGuards(AuthGuard)
  async updateTask(
    @Param('taskId') taskId: string,
    @Body() taskData: Partial<CreateTaskDto>,
  ): Promise<Task> {
    return await this.tasksService.updateTask(taskId, taskData);
  }

  @Delete(':taskId')
  @UseGuards(AuthGuard)
  async deleteTask(@Param('taskId') taskId: string) {
    return await this.tasksService.deleteTask(taskId);
  }

  @Delete('source/:sourceId')
  @UseGuards(AuthGuard)
  async deleteTaskBySourceId(
    @Param('sourceId') sourceId: string,
    @Workspace() workspaceId: string,
    @UserId() userId: string,
  ) {
    return await this.tasksService.deleteTaskBySourceId(
      sourceId,
      workspaceId,
      userId,
    );
  }
}
