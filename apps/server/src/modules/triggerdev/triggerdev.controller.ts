import { Controller, Get, UseGuards } from '@nestjs/common';

import { AuthGuard } from 'modules/auth/auth.guard';

import { TriggerdevService } from './triggerdev.service';

@Controller({
  version: '1',
  path: 'triggerdev',
})
export class TriggerdevController {
  constructor(private triggerdevService: TriggerdevService) {}

  @Get('docker-token')
  @UseGuards(AuthGuard)
  async getDockerToken() {
    return this.triggerdevService.getDockerToken();
  }

  @Get()
  @UseGuards(AuthGuard)
  async getRequiredKeys() {
    return this.triggerdevService.getRequiredKeys();
  }
}
