import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateTaskDto, Task } from '@sigma/types';

import { AuthGuard } from 'modules/auth/auth.guard';
import { Workspace } from 'modules/auth/session.decorator';

import { TasksQueue } from './tasks.queue';
import { TasksService } from './tasks.service';

@Controller({
  version: '1',
  path: 'tasks',
})
export class TasksController {
  constructor(
    private tasks: TasksService,
    private tasksQueue: TasksQueue,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  async createTask(
    @Workspace() workspaceId: string,
    @Body() taskData: CreateTaskDto,
  ): Promise<Task> {
    return await this.tasks.createTask(taskData, workspaceId);
  }

  @Get('scheduled')
  @UseGuards(AuthGuard)
  async getScheduledTasks() {
    return this.tasksQueue.listScheduledTasks();
  }

  @Get('scheduled/:taskId/next')
  @UseGuards(AuthGuard)
  async getNextExecutionTime(@Param('taskId') taskId: string) {
    return this.tasksQueue.getNextExecutionTime(taskId);
  }

  @Delete('scheduled/:taskId')
  @UseGuards(AuthGuard)
  async removeScheduledTask(@Param('taskId') taskId: string) {
    return this.tasksQueue.removeTaskSchedule(taskId);
  }

  @Post(':taskId')
  @UseGuards(AuthGuard)
  async updateTask(
    @Param('taskId') taskId: string,
    @Body() taskData: Partial<CreateTaskDto>,
  ): Promise<Task> {
    return await this.tasks.update(taskId, taskData);
  }

  @Delete(':taskId')
  @UseGuards(AuthGuard)
  async deleteTask(@Param('taskId') taskId: string) {
    return await this.tasks.deleteTask(taskId);
  }
}
