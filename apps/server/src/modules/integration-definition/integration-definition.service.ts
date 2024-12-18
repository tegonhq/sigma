import { Injectable } from '@nestjs/common';
import {
  IntegrationDefinition,
  IntegrationDefinitionIdDto,
} from '@sigma/types';
import { PrismaService } from 'nestjs-prisma';

import { fetcher } from 'common/remote-loader/load-remote-module';
import { LoggerService } from 'modules/logger/logger.service';

@Injectable()
export class IntegrationDefinitionService {
  private readonly logger = new LoggerService(
    IntegrationDefinitionService.name,
  );

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
  ): Promise<IntegrationDefinition | undefined> {
    try {
      const integrationDefinition = await this.getIntegrationDefinitionWithId({
        integrationDefinitionId,
      });

      const spec = await fetcher(`${integrationDefinition.url}/spec.json`);

      return { ...integrationDefinition, spec };
    } catch (e) {
      this.logger.error({ message: `Integration spec fetching failed: ${e}` });
      return undefined;
    }
  }
}
