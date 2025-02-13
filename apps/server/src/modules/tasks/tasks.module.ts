import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from 'nestjs-prisma';

import AIRequestsService from 'modules/ai-requests/ai-requests.services';
import { ConversationModule } from 'modules/conversation/conversation.module';
import { IntegrationsService } from 'modules/integrations/integrations.service';
import { PagesService } from 'modules/pages/pages.service';
import { TaskOccurenceService } from 'modules/task-occurence/task-occurence.service';
import { UsersService } from 'modules/users/users.service';

import { TasksAIController } from './tasks-ai.controller';
import TasksAIService from './tasks-ai.service';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [PrismaModule, ConversationModule],
  controllers: [TasksController, TasksAIController],
  providers: [
    PrismaService,
    TasksService,
    UsersService,
    TaskOccurenceService,
    TasksAIService,
    AIRequestsService,
    IntegrationsService,
    PagesService,
  ],
  exports: [TasksService],
})
export class TasksModule {}
