import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from 'nestjs-prisma';

import { ConversationModule } from 'modules/conversation/conversation.module';
import { UsersService } from 'modules/users/users.service';

import { TaskOccurenceController } from './task-occurence.controller';
import { TaskOccurenceService } from './task-occurence.service';

@Module({
  imports: [PrismaModule, ConversationModule],
  controllers: [TaskOccurenceController],
  providers: [PrismaService, TaskOccurenceService, UsersService],
  exports: [TaskOccurenceService],
})
export class TaskOccurenceModule {}
