import { Injectable } from '@nestjs/common';
import {
  IntegrationDefinition,
  IntegrationDefinitionIdDto,
} from '@sigma/types';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class IntegrationDefinitionService {
  constructor(private prisma: PrismaService) {}

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

    // TODO: spec
    return { ...integrationDefinition };
  }
}
