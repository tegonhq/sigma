import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from 'nestjs-prisma';

import { UsersService } from 'modules/users/users.service';

import { ActivityController } from './activity.controller';
import ActivityService from './activity.service';

@Module({
  imports: [PrismaModule],
  controllers: [ActivityController],
  providers: [PrismaService, ActivityService, UsersService],
  exports: [ActivityService],
})
export class ActivityModule {}
