import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from 'nestjs-prisma';

import { WorkspacesModule } from 'modules/workspaces/workspaces.module';

import { ActivityController } from './activity.controller';
import ActivityService from './activity.service';

@Module({
  imports: [PrismaModule, WorkspacesModule],
  controllers: [ActivityController],
  providers: [PrismaService, ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
