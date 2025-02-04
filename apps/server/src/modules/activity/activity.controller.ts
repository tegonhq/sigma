import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CreateActivityDto } from '@sigma/types';

import { AuthGuard } from 'modules/auth/auth.guard';
import { Workspace } from 'modules/auth/session.decorator';

import ActivityService from './activity.service';

@Controller({
  version: '1',
  path: 'activity',
})
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Post()
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
  async createBulkActivities(
    @Body() activitiesDto: CreateActivityDto[],
    @Workspace() workspaceId: string,
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

  @Get(':activityId')
  @UseGuards(AuthGuard)
  async getActivity(@Param('activityId') activityId: string) {
    return await this.activityService.getActivity(activityId);
  }

  @Get('source/:sourceId')
  @UseGuards(AuthGuard)
  async getActivityBySourceId(@Param('sourceId') sourceId: string) {
    return await this.activityService.getActivityBySourceId(sourceId);
  }
}
