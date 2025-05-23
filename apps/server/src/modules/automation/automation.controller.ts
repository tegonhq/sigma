import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { AuthGuard } from 'modules/auth/auth.guard';
import { Workspace } from 'modules/auth/session.decorator';

import AutomationService from './automation.service';

@Controller({
  version: '1',
  path: 'automations',
})
export class AutomationController {
  constructor(private automation: AutomationService) {}

  @Post()
  @UseGuards(AuthGuard)
  async pushActivity(
    @Workspace() workspaceId: string,

    @Body() createActivityDto: { text: string; mcps: string[] },
  ) {
    return await this.automation.createAutomation(
      createActivityDto.text,
      createActivityDto.mcps,
      workspaceId,
    );
  }
}
