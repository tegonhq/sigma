import { Module } from '@nestjs/common';
import { PrismaModule } from 'nestjs-prisma';

import AIRequestsService from 'modules/ai-requests/ai-requests.services';
import { ConversationService } from 'modules/conversation/conversation.service';
import { UsersService } from 'modules/users/users.service';

import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';

@Module({
  imports: [PrismaModule],
  controllers: [PagesController],
  providers: [
    PagesService,
    UsersService,
    AIRequestsService,
    ConversationService,
  ],
  exports: [PagesService],
})
export class PagesModule {}
