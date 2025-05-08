import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ActivityModule } from 'modules/activity/activity.module';
import { PagesModule } from 'modules/pages/pages.module';
import { SyncModule } from 'modules/sync/sync.module';
import SyncActionsService from 'modules/sync-actions/sync-actions.service';
import { TaskOccurenceService } from 'modules/task-occurrence/task-occurrence.service';
import { TasksHookModule } from 'modules/tasks-hook/tasks-hooks.module';

import ReplicationService from './replication.service';

@Module({
  imports: [SyncModule, PagesModule, TasksHookModule, ActivityModule],
  controllers: [],
  providers: [
    ReplicationService,
    ConfigService,
    SyncActionsService,
    TaskOccurenceService,
  ],
  exports: [],
})
export class ReplicationModule {}
