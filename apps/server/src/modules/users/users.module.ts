import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from 'nestjs-prisma';

import AIRequestsService from 'modules/ai-requests/ai-requests.services';
import { SupertokensService } from 'modules/auth/supertokens/supertokens.service';
import WorkspacesService from 'modules/workspaces/workspaces.service';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [
    PrismaService,
    SupertokensService,
    WorkspacesService,
    UsersService,
    AIRequestsService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
