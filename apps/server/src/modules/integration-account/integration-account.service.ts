import { Injectable } from '@nestjs/common';
import {
  CreateIntegrationAccountDto,
  InputJsonValue,
  IntegrationAccount,
  IntegrationAccountIdDto,
  IntegrationPayloadEventType,
  UpdateIntegrationAccountDto,
} from '@tegonhq/sigma-sdk';
import { PrismaService } from 'nestjs-prisma';

import { IntegrationsService } from 'modules/integrations/integrations.service';

import {
  IntegrationAccountSelect,
  IntegrationAccountSelectByNames,
} from './integration-account.interface';

@Injectable()
export class IntegrationAccountService {
  constructor(
    private prisma: PrismaService,
    private integrationService: IntegrationsService,
  ) {}

  async createIntegrationAccount(
    workspaceId: string,
    createIntegrationAccountDto: CreateIntegrationAccountDto,
  ) {
    const {
      config: integrationConfiguration,
      userId,
      settings,
      accountId,
      integrationDefinitionId,
    } = createIntegrationAccountDto;
    // Update the integration account with the new configuration in the database
    const integrationAccount = await this.prisma.integrationAccount.upsert({
      where: {
        accountId_integrationDefinitionId_workspaceId: {
          accountId,
          integrationDefinitionId,
          workspaceId,
        },
      },
      create: {
        integrationConfiguration,
        settings,
        accountId,
        integratedById: userId,
        workspaceId,
        integrationDefinitionId,
        isActive: true,
      },
      update: {
        deleted: null,
        integrationConfiguration,
        settings,
        isActive: true,
      },
    });

    return integrationAccount;
  }

  async createIntegrationAccountByApiKey(
    workspaceId: string,
    userId: string,
    createIntegrationAccountDto: Partial<CreateIntegrationAccountDto>,
  ) {
    const integrationDefinition =
      await this.prisma.integrationDefinitionV2.findUnique({
        where: { id: createIntegrationAccountDto.integrationDefinitionId },
      });

    const integrationAccount =
      await this.integrationService.runIntegrationTrigger(
        integrationDefinition,
        {
          event: IntegrationPayloadEventType.INTEGRATION_ACCOUNT_CREATED,
          userId,
          workspaceId,
          eventBody: {
            integrationDefinition,
            ...createIntegrationAccountDto,
          },
        },
        userId,
        workspaceId,
      );

    await this.integrationService.runIntegrationTriggerAsync(
      integrationDefinition,
      {
        event: IntegrationPayloadEventType.INITIAL_TASK_SYNC,
        userId,
        workspaceId,
        eventBody: {
          integrationAccount,
          integrationDefinition,
        },
      },
      userId,
      workspaceId,
    );

    return integrationAccount;
  }

  async getIntegrationAccountWithId(integrationAccountId: string) {
    return await this.prisma.integrationAccount.findUnique({
      where: {
        id: integrationAccountId,
      },
      select: IntegrationAccountSelect,
    });
  }

  async deleteIntegrationAccount(
    integrationAccountRequestIdBody: IntegrationAccountIdDto,
  ) {
    return await this.prisma.integrationAccount.update({
      where: {
        id: integrationAccountRequestIdBody.integrationAccountId,
      },
      data: {
        deleted: new Date().toISOString(),
        isActive: false,
      },
      include: {
        integrationDefinition: true,
        workspace: true,
      },
    });
  }

  async getIntegrationAccount(
    integrationAccountId: string,
    workspaceId: string,
  ) {
    const integrationAccount = await this.prisma.integrationAccount.findUnique({
      where: {
        workspaceId,
        id: integrationAccountId,
      },
      select: IntegrationAccountSelect,
    });

    return integrationAccount;
  }

  async getIntegrationAccountWithToken(
    integrationAccountId: string,
    workspaceId: string,
  ) {
    const integrationAccount =
      await this.prisma.integrationAccount.findUniqueOrThrow({
        where: {
          workspaceId,
          id: integrationAccountId,
        },
        include: {
          integrationDefinition: true,
        },
      });

    const accessToken = await this.integrationService.runIntegrationTrigger(
      integrationAccount.integrationDefinition,
      {
        event: IntegrationPayloadEventType.REFRESH_ACCESS_TOKEN,
        workspaceId,
        eventBody: {
          integrationAccount,
        },
      },
      integrationAccount.integratedById,
      workspaceId,
    );

    return {
      ...integrationAccount,
      token: accessToken,
    };
  }

  async getIntegrationAccountsForWorkspace(workspaceId: string) {
    return await this.prisma.integrationAccount.findMany({
      where: {
        workspace: {
          id: workspaceId,
        },
      },
      orderBy: [
        {
          updatedAt: 'asc',
        },
      ],
      select: IntegrationAccountSelect,
    });
  }

  async updateIntegrationAccount(
    integrationAccountId: string,
    updateIntegrationAccountBody: UpdateIntegrationAccountDto,
  ) {
    return await this.prisma.integrationAccount.update({
      data: {
        ...updateIntegrationAccountBody,
        settings: updateIntegrationAccountBody.settings as InputJsonValue,
      },
      where: {
        id: integrationAccountId,
      },
      select: IntegrationAccountSelect,
    });
  }

  async getIntegrationAccountByAccountId(accountId: string) {
    return await this.prisma.integrationAccount.findFirst({
      where: { accountId, deleted: null },
      select: IntegrationAccountSelect,
    });
  }

  async getIntegrationAccountsByName(
    integrations: string,
    workspaceId: string,
  ) {
    const accounts = await this.prisma.integrationAccount.findMany({
      where: {
        workspaceId,
        integrationDefinition: {
          slug: {
            in: integrations.split(','),
          },
        },
        deleted: null,
      },
      select: IntegrationAccountSelectByNames,
    });

    const accountsWithTokens = await Promise.all(
      accounts.map(async (account: IntegrationAccount) => {
        const accountWithToken = await this.getIntegrationAccountWithToken(
          account.id,
          account.workspaceId,
        );
        return {
          ...account,
          integrationConfiguration: { access_token: accountWithToken.token },
        };
      }),
    );

    return accountsWithTokens.reduce(
      (acc, account) => {
        acc[account.integrationDefinition.slug] = account;
        return acc;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      {} as Record<string, any>,
    );
  }

  async getIntegrationAccounts(workspaceId: string) {
    return await this.prisma.integrationAccount.findMany({
      where: {
        workspaceId,
        deleted: null,
      },
    });
  }
}
