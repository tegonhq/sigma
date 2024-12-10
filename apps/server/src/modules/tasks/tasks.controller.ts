import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateTaskDto, Task } from '@sigma/types';

import { AuthGuard } from 'modules/auth/auth.guard';
import { Workspace } from 'modules/auth/session.decorator';

import { TasksService } from './tasks.service';

@Controller({
  version: '1',
  path: 'tasks',
})
export class TasksController {
  constructor(private tasks: TasksService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createTask(
    @Workspace() workspaceId: string,
    @Body() taskData: CreateTaskDto,
  ): Promise<Task> {
    return await this.tasks.createTask(taskData, workspaceId);
  }
}
