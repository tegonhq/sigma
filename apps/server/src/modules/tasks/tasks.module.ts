import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from 'nestjs-prisma';

import AIRequestsService from 'modules/ai-requests/ai-requests.services';
import { ContentModule } from 'modules/content/content.module';
import { ConversationModule } from 'modules/conversation/conversation.module';
import { IntegrationsService } from 'modules/integrations/integrations.service';
import { PagesService } from 'modules/pages/pages.service';
import { TaskOccurenceService } from 'modules/task-occurrence/task-occurrence.service';
import { UsersService } from 'modules/users/users.service';

import { TasksAIController } from './tasks-ai.controller';
import TasksAIService from './tasks-ai.service';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TaskHooksService } from '../tasks-hook/tasks-hook.service';

@Module({
  imports: [PrismaModule, ConversationModule, ContentModule],
  controllers: [TasksController, TasksAIController],
  providers: [
    PrismaService,
    TasksService,
    TasksAIService,
    UsersService,
    TaskOccurenceService,
    AIRequestsService,
    IntegrationsService,
    PagesService,
    TaskHooksService,
  ],
  exports: [TasksService],
})
export class TasksModule {}
