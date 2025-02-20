import { Module } from '@nestjs/common';

import { SyncModule } from 'modules/sync/sync.module';
import { UsersService } from 'modules/users/users.service';

import { SuggestionController } from './suggestion.controller';
import SuggestionService from './suggestion.service';

@Module({
  imports: [SyncModule],
  controllers: [SuggestionController],
  providers: [SuggestionService, UsersService],
  exports: [SuggestionService],
})
export class SuggestionModule {}
