import { Module } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

import { TasksModule } from 'modules/tasks/tasks.module';

import { ContentService } from './content.service';

@Module({
  imports: [TasksModule],
  controllers: [],
  providers: [ContentService, PrismaService],
  exports: [ContentService],
})
export class ContentModule {}
