import { Injectable } from '@nestjs/common';
import {
  CreateIntegrationAccountDto,
  InputJsonValue,
  IntegrationAccountIdDto,
  UpdateIntegrationAccountDto,
} from '@sigma/types';
import { PrismaService } from 'nestjs-prisma';

import {
  IntegrationAccountSelect,
  IntegrationAccountSelectByNames,
} from './integration-account.interface';

@Injectable()
export class IntegrationAccountService {
  constructor(private prisma: PrismaService) {}

  async createIntegrationAccount(
    createIntegrationAccountDto: CreateIntegrationAccountDto,
  ) {
    const {
      config: integrationConfiguration,
      userId,
      settings,
      accountId,
      integrationDefinitionId,
      workspaceId,
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

    return accounts.reduce(
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
