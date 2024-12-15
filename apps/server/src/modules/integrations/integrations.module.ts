import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { UsersService } from 'modules/users/users.service';

import { IntegrationsController } from './integrations.controller';
import { IntegrationsProcessor } from './integrations.process';
import { IntegrationsQueue } from './integrations.queue';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'integrations',
      connection: {
        host: process.env.REDIS_URL,
        port: Number(process.env.REDIS_PORT),
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    }),
  ],
  controllers: [IntegrationsController],
  providers: [UsersService, IntegrationsQueue, IntegrationsProcessor],
  exports: [IntegrationsQueue],
})
export class IntegrationsModule {}
