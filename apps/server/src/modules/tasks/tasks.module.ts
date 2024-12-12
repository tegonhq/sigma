import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from 'nestjs-prisma';

import { ConversationModule } from 'modules/conversation/conversation.module';
import { UsersService } from 'modules/users/users.service';

import { TasksController } from './tasks.controller';
import { TasksProcessor } from './tasks.processor';
import { TasksQueue } from './tasks.queue';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    PrismaModule,
    ConversationModule,
    BullModule.registerQueue({
      name: 'tasks',
      connection: {
        host: process.env.REDIS_URL,
        port: Number(process.env.REDIS_PORT),
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    }),
  ],
  controllers: [TasksController],
  providers: [
    PrismaService,
    TasksService,
    UsersService,
    TasksProcessor,
    TasksQueue,
  ],
  exports: [TasksService, TasksProcessor],
})
export class TasksModule {}
