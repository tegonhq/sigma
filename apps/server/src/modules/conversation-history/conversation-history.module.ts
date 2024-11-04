import { Module } from '@nestjs/common';
import { PrismaModule } from 'nestjs-prisma';

import { ConversationController } from './conversation-history.controller';
import { ConversationService } from './conversation-history.service';

@Module({
  imports: [PrismaModule],
  controllers: [ConversationController],
  providers: [ConversationService],
  exports: [ConversationService],
})
export class ConversationModule {}
