import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from 'nestjs-prisma';

import { IntegrationDefinitionModule } from 'modules/integration-definition/integration-definition.module';
import { IntegrationsService } from 'modules/integrations/integrations.service';
import { UsersService } from 'modules/users/users.service';

import { IntegrationAccountController } from './integration-account.controller';
import { IntegrationAccountService } from './integration-account.service';

@Module({
  imports: [PrismaModule, IntegrationDefinitionModule],
  controllers: [IntegrationAccountController],
  providers: [
    PrismaService,
    IntegrationAccountService,
    UsersService,
    IntegrationsService,
  ],
  exports: [IntegrationAccountService],
})
export class IntegrationAccountModule {}
