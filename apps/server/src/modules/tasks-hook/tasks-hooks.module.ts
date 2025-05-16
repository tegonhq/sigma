import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from 'nestjs-prisma';

import { IntegrationsService } from 'modules/integrations/integrations.service';
import { PagesModule } from 'modules/pages/pages.module';
import { TaskOccurenceService } from 'modules/task-occurrence/task-occurrence.service';
import { TaskVectorService } from 'modules/tasks/tasks-vector.service';
import { TasksService } from 'modules/tasks/tasks.service';
import { UsersService } from 'modules/users/users.service';
import { VectorStoreService } from 'modules/vector/vector.service';

import { TaskHooksService } from './tasks-hook.service';

@Module({
  imports: [PrismaModule, PagesModule],
  controllers: [],
  providers: [
    PrismaService,
    UsersService,
    TaskOccurenceService,
    IntegrationsService,
    TaskHooksService,
    TaskVectorService,
    VectorStoreService,
    TasksService,
  ],
  exports: [TaskHooksService],
})
export class TasksHookModule {}
