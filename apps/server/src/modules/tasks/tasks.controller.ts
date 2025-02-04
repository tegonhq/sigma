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
import { CreateTaskDto, Task } from '@sigma/types';

import { AuthGuard } from 'modules/auth/auth.guard';
import { Workspace } from 'modules/auth/session.decorator';

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
    @Body() taskData: CreateTaskDto,
  ): Promise<Task> {
    return await this.tasksService.createTask(taskData, workspaceId);
  }

  @Post('bulk')
  @UseGuards(AuthGuard)
  async createBulkTasks(
    @Body() tasksData: CreateTaskDto[],
    @Workspace() workspaceId: string,
  ): Promise<Task[]> {
    const tasks = [];
    for (const taskData of tasksData) {
      const task = await this.tasksService.createTask(taskData, workspaceId);
      tasks.push(task);
    }
    return tasks;
  }

  @Post(':taskId')
  @UseGuards(AuthGuard)
  async updateTask(
    @Param('taskId') taskId: string,
    @Body() taskData: Partial<CreateTaskDto>,
  ): Promise<Task> {
    return await this.tasksService.update(taskId, taskData);
  }

  @Delete('url')
  @UseGuards(AuthGuard)
  async deleteTaskByUrl(
    @Query('workspaceId') workspaceId: string,
    @Query('url') url: string,
  ) {
    return await this.tasksService.deleteTaskByUrl(url, workspaceId);
  }

  @Delete(':taskId')
  @UseGuards(AuthGuard)
  async deleteTask(@Param('taskId') taskId: string) {
    return await this.tasksService.deleteTask(taskId);
  }

  @Delete('source/:sourceId')
  @UseGuards(AuthGuard)
  async deleteTaskBySourceId(@Param('sourceId') sourceId: string) {
    return await this.tasksService.deleteTaskBySourceId(sourceId);
  }
}
