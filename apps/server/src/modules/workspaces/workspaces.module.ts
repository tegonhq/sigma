import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from 'nestjs-prisma';

import AIRequestsService from 'modules/ai-requests/ai-requests.services';
import { ListsModule } from 'modules/lists/lists.module';
import { UsersService } from 'modules/users/users.service';

import { WorkspacesController } from './workspaces.controller';
import WorkspacesService from './workspaces.service';

@Module({
  imports: [PrismaModule, HttpModule, ListsModule],
  controllers: [WorkspacesController],
  providers: [
    WorkspacesService,
    PrismaService,
    UsersService,
    AIRequestsService,
  ],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
