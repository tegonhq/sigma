import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PagesModule } from 'modules/pages/pages.module';
import { SyncModule } from 'modules/sync/sync.module';
import SyncActionsService from 'modules/sync-actions/sync-actions.service';

import ReplicationService from './replication.service';
import { TasksHookModule } from 'modules/tasks-hook/tasks-hooks.module';

@Module({
  imports: [SyncModule, PagesModule, TasksHookModule],
  controllers: [],
  providers: [ReplicationService, ConfigService, SyncActionsService],
  exports: [],
})
export class ReplicationModule {}
