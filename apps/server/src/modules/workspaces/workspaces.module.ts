import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from 'nestjs-prisma';

import AIRequestsService from 'modules/ai-requests/ai-requests.services';
import { ContentModule } from 'modules/content/content.module';
import { ListsModule } from 'modules/lists/lists.module';
import { UsersService } from 'modules/users/users.service';

import { WorkspacesController } from './workspaces.controller';
import WorkspacesService from './workspaces.service';

@Module({
  imports: [PrismaModule, HttpModule, ListsModule, ContentModule],
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
