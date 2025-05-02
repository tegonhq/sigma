import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from 'nestjs-prisma';

import AIRequestsService from 'modules/ai-requests/ai-requests.services';
import { SupertokensService } from 'modules/auth/supertokens/supertokens.service';
import { ListsModule } from 'modules/lists/lists.module';
import { TasksModule } from 'modules/tasks/tasks.module';
import { WorkspacesModule } from 'modules/workspaces/workspaces.module';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [PrismaModule, ListsModule, TasksModule, WorkspacesModule],
  controllers: [UsersController],
  providers: [
    PrismaService,
    SupertokensService,

    UsersService,
    AIRequestsService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
