import { Module } from '@nestjs/common';

import { UsersService } from 'modules/users/users.service';
import WorkspacesService from 'modules/workspaces/workspaces.service';

import { TriggerdevController } from './triggerdev.controller';
import { TriggerdevService } from './triggerdev.service';

@Module({
  imports: [],
  controllers: [TriggerdevController],
  providers: [TriggerdevService, UsersService, WorkspacesService],
  exports: [TriggerdevService],
})
export class TriggerdevModule {}
