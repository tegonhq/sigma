import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from 'nestjs-prisma';

import { ActivityController } from './activity.controller';
import ActivityService from './activity.service';

@Module({
  imports: [PrismaModule],
  controllers: [ActivityController],
  providers: [PrismaService, ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
