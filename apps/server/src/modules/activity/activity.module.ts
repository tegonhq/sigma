import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from 'nestjs-prisma';

import { WorkspacesModule } from 'modules/workspaces/workspaces.module';

import ActivityService from './activity.service';

@Module({
  imports: [PrismaModule, WorkspacesModule],
  controllers: [],
  providers: [PrismaService, ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
