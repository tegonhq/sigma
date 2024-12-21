import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  CreateIntegrationAccountDto,
  IntegrationAccount,
  IntegrationAccountIdDto,
  IntegrationAccountWithToken,
  UpdateIntegrationAccountDto,
} from '@sigma/types';
import { SessionContainer } from 'supertokens-node/recipe/session';

import { AuthGuard } from 'modules/auth/auth.guard';
import { Session, UserId, Workspace } from 'modules/auth/session.decorator';

import { IntegrationAccountService } from './integration-account.service';

@Controller({
  version: '1',
  path: 'integration_account',
})
export class IntegrationAccountController {
  constructor(private integrationAccountService: IntegrationAccountService) {}

  /**
   * Get all integration accounts in a workspace
   */
  @Get()
  @UseGuards(AuthGuard)
  async getIntegrationAccounts(
    @Workspace() workspaceId: string,
  ): Promise<IntegrationAccount[]> {
    return await this.integrationAccountService.getIntegrationAccountsForWorkspace(
      workspaceId,
    );
  }

  @Get('account_id')
  @UseGuards(AuthGuard)
  async getIntegrationAccountByAccountId(
    @Query('accountId') accountId: string,
  ): Promise<IntegrationAccount> {
    return await this.integrationAccountService.getIntegrationAccountByAccountId(
      accountId,
    );
  }

  @Get('/names')
  @UseGuards(AuthGuard)
  async getIntegrationAccountsByName(
    @Query('integrations') integrations: string,
    @Workspace() workspaceId: string,
    @UserId() userId: string,
  ) {
    return await this.integrationAccountService.getIntegrationAccountsByName(
      integrations,
      workspaceId,
      userId,
    );
  }

  /**
   * Get a integration accounts in a workspace
   */
  @Get(':integrationAccountId/token')
  @UseGuards(AuthGuard)
  async getIntegrationAccountToken(
    @Session() session: SessionContainer,
    @Workspace() workspaceId: string,
    @Param()
    integrationAccountIdRequestIdBody: IntegrationAccountIdDto,
  ): Promise<IntegrationAccountWithToken> {
    const token = session.getAccessToken();
    return await this.integrationAccountService.getIntegrationAccountWithToken(
      integrationAccountIdRequestIdBody.integrationAccountId,
      workspaceId,
      token,
    );
  }

  /**
   * Get a integration accounts in a workspace
   */
  @Get(':integrationAccountId')
  @UseGuards(AuthGuard)
  async getIntegrationAccount(
    @Param()
    integrationAccountIdRequestIdBody: IntegrationAccountIdDto,
  ): Promise<IntegrationAccount> {
    return await this.integrationAccountService.getIntegrationAccountWithId(
      integrationAccountIdRequestIdBody.integrationAccountId,
    );
  }

  /**
   * Delete a Integration account
   */
  @Delete(':integrationAccountId')
  @UseGuards(AuthGuard)
  async deleteIntegrationAccount(
    @Param()
    integrationAccountIdRequestIdBody: IntegrationAccountIdDto,
  ) {
    return await this.integrationAccountService.deleteIntegrationAccount(
      integrationAccountIdRequestIdBody,
    );
  }

  @Post()
  @UseGuards(AuthGuard)
  async createIntegrationAccount(
    @Body()
    createIntegrationAccountDto: CreateIntegrationAccountDto,
  ): Promise<IntegrationAccount> {
    return await this.integrationAccountService.createIntegrationAccount(
      createIntegrationAccountDto,
    );
  }

  /**
   * Update a integration account in workspace
   */
  @Post(':integrationAccountId')
  @UseGuards(AuthGuard)
  async updateIntegrationAccount(
    @Param()
    integrationAccountIdRequestIdBody: IntegrationAccountIdDto,
    @Body()
    updateIntegrationAccountBody: UpdateIntegrationAccountDto,
  ): Promise<IntegrationAccount> {
    return await this.integrationAccountService.updateIntegrationAccount(
      integrationAccountIdRequestIdBody.integrationAccountId,
      updateIntegrationAccountBody,
    );
  }
}
