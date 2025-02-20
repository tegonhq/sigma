import { Module } from '@nestjs/common';

import { SyncModule } from 'modules/sync/sync.module';
import { UsersService } from 'modules/users/users.service';

import { SummaryController } from './summary.controller';
import SummaryService from './summary.service';

@Module({
  imports: [SyncModule],
  controllers: [SummaryController],
  providers: [SummaryService, UsersService],
  exports: [SummaryService],
})
export class SummaryModule {}
