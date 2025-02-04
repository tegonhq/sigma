import { Module } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

import { UsersService } from 'modules/users/users.service';

import { IntegrationsService } from './integrations.service';

@Module({
  imports: [],
  controllers: [],
  providers: [PrismaService, UsersService, IntegrationsService],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
