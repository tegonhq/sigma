import { Injectable } from '@nestjs/common';
import {
  IntegrationDefinition,
  IntegrationDefinitionIdDto,
} from '@sigma/types';
import { PrismaService } from 'nestjs-prisma';

import { fetcher } from 'common/remote-loader/load-remote-module';

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

    // const spec = await loadRemoteModule(
    //   `${integrationDefinition.url}/spec.json`,
    // );

    const spec = JSON.parse(
      await fetcher(
        `file:///Users/manoj/work/sigma-integrations/${integrationDefinition.slug}/spec.json`,
      ),
    );

    return { ...integrationDefinition, spec };
  }
}
