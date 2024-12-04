import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  IntegrationDefinition,
  IntegrationDefinitionIdDto,
  WorkspaceRequestParamsDto,
} from '@sigma/types';

import { AuthGuard } from 'modules/auth/auth.guard';

import { IntegrationDefinitionService } from './integration-definition.service';

@Controller({
  version: '1',
  path: 'integration_definition',
})
export class IntegrationDefinitionController {
  constructor(
    private integrationDefinitionService: IntegrationDefinitionService,
  ) {}

  /**
   * Get all integration definitions in a workspace
   */
  @Get()
  @UseGuards(AuthGuard)
  async getIntegrationDefinitionsByWorkspace(
    @Query()
    workspaceDto: WorkspaceRequestParamsDto,
  ) {
    return await this.integrationDefinitionService.getIntegrationDefinitions(
      workspaceDto.workspaceId,
    );
  }

  // /**
  //  * Get integration definition
  //  */
  @Get(':integrationDefinitionId')
  @UseGuards(AuthGuard)
  async getIntegrationDefinition(
    @Param()
    integrationDefinitionRequestIdBody: IntegrationDefinitionIdDto,
  ) {
    return await this.integrationDefinitionService.getIntegrationDefinitionWithSpec(
      integrationDefinitionRequestIdBody.integrationDefinitionId,
    );
  }

  // /**
  //  * Get spec for integration definition
  //  */
  @Get(':integrationDefinitionId/spec')
  @UseGuards(AuthGuard)
  async getIntegrationDefinitionSpec(
    @Param()
    integrationDefinitionRequestIdBody: IntegrationDefinitionIdDto,
  ) {
    const integrationDefinition =
      await this.integrationDefinitionService.getIntegrationDefinitionWithSpec(
        integrationDefinitionRequestIdBody.integrationDefinitionId,
      );

    return integrationDefinition.spec;
  }

  /**
   * Get a integration definition in a workspace
   */
  @Get(':integrationDefinitionId')
  async getIntegrationDefinitionWithId(
    @Param()
    integrationDefinitionRequestIdBody: IntegrationDefinitionIdDto,
  ): Promise<IntegrationDefinition> {
    return await this.integrationDefinitionService.getIntegrationDefinitionWithId(
      integrationDefinitionRequestIdBody,
    );
  }
}
