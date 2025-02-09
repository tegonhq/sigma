import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { IntegrationDefinitionIdDto } from '@sigma/types';

import { AuthGuard } from 'modules/auth/auth.guard';
import { Workspace } from 'modules/auth/session.decorator';

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
  async getIntegrationDefinitionsByWorkspace(@Workspace() workspaceId: string) {
    return await this.integrationDefinitionService.getIntegrationDefinitions(
      workspaceId,
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
}
