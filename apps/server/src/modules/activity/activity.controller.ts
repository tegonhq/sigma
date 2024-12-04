import { Body, Controller, Post } from '@nestjs/common';
import { CreateActivityDto } from '@sigma/types';

import { Workspace } from 'modules/auth/session.decorator';

import ActivityService from './activity.service';

@Controller({
  version: '1',
  path: 'activity',
})
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Post()
  async createActivity(
    @Workspace() workspaceId: string,
    @Body() activityDto: CreateActivityDto,
  ) {
    const eventResponse = await this.activityService.createActivity(
      workspaceId,
      activityDto,
    );
    return eventResponse;
  }
}
