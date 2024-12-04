import { Module } from '@nestjs/common';
import { PrismaModule, PrismaService } from 'nestjs-prisma';

import { IntegrationsModule } from 'modules/integrations/integrations.module';
import { UsersService } from 'modules/users/users.service';

import { IntegrationDefinitionController } from './integration-definition.controller';
import { IntegrationDefinitionService } from './integration-definition.service';

@Module({
  imports: [PrismaModule, IntegrationsModule],
  controllers: [IntegrationDefinitionController],
  providers: [PrismaService, IntegrationDefinitionService, UsersService],
  exports: [IntegrationDefinitionService],
})
export class IntegrationDefinitionModule {}
