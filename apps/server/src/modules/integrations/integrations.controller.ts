import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';

import { AuthGuard } from 'modules/auth/auth.guard';

import { IntegrationsQueue } from './integrations.queue';

@Controller({
  version: '1',
  path: 'integrations',
})
export class IntegrationsController {
  constructor(private integrationsQueue: IntegrationsQueue) {}

  @Get('scheduled')
  @UseGuards(AuthGuard)
  async getScheduledTasks() {
    return this.integrationsQueue.listScheduledTasks();
  }

  @Get('scheduled/:taskId/next')
  @UseGuards(AuthGuard)
  async getNextExecutionTime(@Param('taskId') taskId: string) {
    return this.integrationsQueue.getNextExecutionTime(taskId);
  }

  @Delete('scheduled/:taskId')
  @UseGuards(AuthGuard)
  async removeScheduledTask(@Param('taskId') taskId: string) {
    return this.integrationsQueue.removeTaskSchedule(taskId);
  }
}
