import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { AuthGuard } from 'modules/auth/auth.guard';
import { Workspace } from 'modules/auth/session.decorator';

import {
  BootstrapRequestQuery,
  DeltaRequestQuery,
} from './sync-actions.interface';
import SyncActionsService from './sync-actions.service';

@Controller({
  version: '1',
  path: 'sync_actions',
})
export class SyncActionsController {
  constructor(private syncActionsService: SyncActionsService) {}

  @Get('bootstrap')
  @UseGuards(AuthGuard)
  async getBootstrap(@Query() BootstrapQuery: BootstrapRequestQuery) {
    return await this.syncActionsService.getBootstrap(
      BootstrapQuery.modelNames,
      BootstrapQuery.workspaceId,
    );
  }

  @Get('delta')
  @UseGuards(AuthGuard)
  async getDelta(
    @Query() deltaQuery: DeltaRequestQuery,
    @Workspace() workspaceId: string,
  ) {
    return await this.syncActionsService.getDelta(
      deltaQuery.modelNames,
      BigInt(deltaQuery.lastSequenceId),
      workspaceId,
    );
  }
}
