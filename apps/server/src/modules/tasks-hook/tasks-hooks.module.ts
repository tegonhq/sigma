import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from 'nestjs-prisma';

import { IntegrationsService } from 'modules/integrations/integrations.service';
import { PagesService } from 'modules/pages/pages.service';
import { TaskOccurenceService } from 'modules/task-occurence/task-occurence.service';
import { UsersService } from 'modules/users/users.service';

import { TaskHooksService } from './tasks-hook.service';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [
    PrismaService,
    UsersService,
    TaskOccurenceService,
    IntegrationsService,
    PagesService,
    TaskHooksService,
  ],
  exports: [TaskHooksService],
})
export class TasksHookModule {}
