import { Module } from '@nestjs/common';

// import { DiscordBotService } from './discord-bot.service';
import { UsersService } from 'modules/users/users.service';

import { IntegrationsService } from './integrations.service';

@Module({
  imports: [],
  controllers: [],
  providers: [IntegrationsService, UsersService],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
