import { Body, Controller, Post, Query } from '@nestjs/common';
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

  @Post('bulk')
  async createBulkActivities(
    @Query('workspaceId') workspaceId: string,
    @Body() activitiesDto: CreateActivityDto[],
  ) {
    const activities = [];
    for (const activityDto of activitiesDto) {
      const activity = await this.activityService.createActivity(
        workspaceId,
        activityDto,
      );
      activities.push(activity);
    }
    return activities;
  }
}
