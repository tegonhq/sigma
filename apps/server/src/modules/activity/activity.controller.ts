import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CreateActivityDto } from '@tegonhq/sigma-sdk';

import { AuthGuard } from 'modules/auth/auth.guard';
import { UserId, Workspace } from 'modules/auth/session.decorator';

import ActivityService from './activity.service';

@Controller({
  version: '1',
  path: 'activity',
})
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Post()
  @UseGuards(AuthGuard)
  async pushActivity(
    @Workspace() workspaceId: string,
    @UserId() userId: string,
    @Body() createActivityDto: CreateActivityDto,
  ) {
    return await this.activityService.createActivity(
      createActivityDto,
      workspaceId,
      userId,
    );
  }
}
