import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateBulkTasksDto, CreateTaskDto, Task } from '@sigma/types';

import { AuthGuard } from 'modules/auth/auth.guard';
import { UserId, Workspace } from 'modules/auth/session.decorator';

import { TasksService } from './tasks.service';

@Controller({
  version: '1',
  path: 'tasks',
})
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get(':taskId')
  @UseGuards(AuthGuard)
  async getTaskById(@Param('taskId') taskId: string): Promise<Task> {
    return await this.tasksService.getTaskById(taskId);
  }

  @Get('source/:sourceId')
  @UseGuards(AuthGuard)
  async getTaskBySource(@Param('sourceId') sourceId: string): Promise<Task> {
    return await this.tasksService.getTaskBySourceId(sourceId);
  }

  @Post()
  @UseGuards(AuthGuard)
  async createTask(
    @Workspace() workspaceId: string,
    @UserId() userId: string,
    @Body() taskData: CreateTaskDto,
  ): Promise<Task> {
    return await this.tasksService.createTask(taskData, workspaceId, userId);
  }

  @Post('bulk')
  @UseGuards(AuthGuard)
  async createBulkTasks(
    @Body() tasksData: CreateBulkTasksDto,
    @UserId() userId: string,
    @Workspace() workspaceId: string,
  ): Promise<Task[]> {
    return await this.tasksService.createBulkTasks(
      tasksData,
      workspaceId,
      userId,
    );
  }

  @Post(':taskId')
  @UseGuards(AuthGuard)
  async updateTask(
    @Param('taskId') taskId: string,
    @UserId() userId: string,
    @Workspace() workspaceId: string,
    @Body() taskData: Partial<CreateTaskDto>,
  ): Promise<Task> {
    return await this.tasksService.update(
      taskId,
      taskData,
      workspaceId,
      userId,
    );
  }

  @Delete(':taskId')
  @UseGuards(AuthGuard)
  async deleteTask(
    @Param('taskId') taskId: string,
    @Workspace() workspaceId: string,
    @UserId() userId: string,
  ) {
    return await this.tasksService.deleteTask(taskId, workspaceId, userId);
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
