import { Injectable } from '@nestjs/common';
import {
  IntegrationDefinition,
  IntegrationDefinitionIdDto,
  IntegrationEventPayload,
  IntegrationPayloadEventType,
} from '@sigma/types';
import { PrismaService } from 'nestjs-prisma';

import { IntegrationsService } from 'modules/integrations/integrations.service';

@Injectable()
export class IntegrationDefinitionService {
  constructor(
    private prisma: PrismaService,
    private integrations: IntegrationsService,
  ) {}

  async getIntegrationDefinitions(
    workspaceId: string,
  ): Promise<IntegrationDefinition[]> {
    return await this.prisma.integrationDefinitionV2.findMany({
      where: {
        OR: [
          {
            workspaceId: null,
          },
          {
            workspaceId,
          },
        ],
      },
    });
  }

  async getIntegrationDefinitionWithId(
    integrationDefinitionRequestIdBody: IntegrationDefinitionIdDto,
  ): Promise<IntegrationDefinition> {
    return await this.prisma.integrationDefinitionV2.findUnique({
      where: { id: integrationDefinitionRequestIdBody.integrationDefinitionId },
    });
  }

  async getIntegrationDefinitionWithSpec(
    integrationDefinitionId: string,
  ): Promise<IntegrationDefinition> {
    const integrationDefinition = await this.getIntegrationDefinitionWithId({
      integrationDefinitionId,
    });

    const payload: IntegrationEventPayload = {
      event: IntegrationPayloadEventType.SPEC,
    };

    const spec = await this.integrations.loadIntegration(
      integrationDefinition.slug,
      payload,
    );

    return { ...integrationDefinition, spec };
  }
}
