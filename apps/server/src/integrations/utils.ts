import { PrismaClient } from '@prisma/client';
import { CreateIntegrationAccountDto } from '@sigma/types';

export async function createIntegrationAccount(
  prisma: PrismaClient,
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
  const integrationAccount = await prisma.integrationAccount.upsert({
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
