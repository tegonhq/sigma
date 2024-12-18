import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { IntegrationPayloadEventType } from '@sigma/types';
import { Job } from 'bullmq';
import { PrismaService } from 'nestjs-prisma';

import {
  createAxiosInstance,
  getRequires,
  loadRemoteModule,
} from 'common/remote-loader';

import { UsersService } from 'modules/users/users.service';

@Processor('integrations')
export class IntegrationsProcessor extends WorkerHost {
  private readonly logger = new Logger(IntegrationsProcessor.name);

  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {
    super();
  }

  async process(job: Job) {
    this.logger.log(`Processing job ${job.name} with data:`, job.data);

    switch (job.name) {
      case 'scheduled-integration':
        return this.processScheduledIntegration(job);

      case 'sync-initial-tasks':
        return this.syncInitialTasks(job);

      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  async processScheduledIntegration(
    job: Job<{ integrationAccountId: string }>,
  ) {
    const { integrationAccountId } = job.data;
    this.logger.log(`Processing integration account ${integrationAccountId}`);

    try {
      //   const integrationAccount =
      //     await this.prisma.integrationAccount.findUnique({
      //       where: { id: integrationAccountId },
      //       include: { integrationDefinition: true },
      //     });

      //   const pat = await this.usersService.getOrCreatePat(
      //     integrationAccount.integratedById,
      //     integrationAccount.workspaceId,
      //   );

      //   const integrationFunction = await loadRemoteModule(
      //     getRequires(createAxiosInstance(pat)),
      //   );
      //   const integration = await integrationFunction(
      //     `file:///Users/manoj/work/sigma-integrations/${integrationAccount.integrationDefinition.slug}/dist/backend/index.js`,
      //   );

      //   await integration.run({
      //     event: IntegrationPayloadEventType.SCHEDULED_TASK,
      //     eventBody: {
      //       integrationAccount,
      //     },
      //   });

      this.logger.log(`Successfully completed task ${integrationAccountId}`);
    } catch (error) {
      this.logger.error(
        `Failed to process task ${integrationAccountId}:`,
        error,
      );

      throw error; // Rethrow to let BullMQ handle retries
    }
  }

  async syncInitialTasks(job: Job<{ integrationAccountId: string }>) {
    const { integrationAccountId } = job.data;
    const integrationAccount = await this.prisma.integrationAccount.findUnique({
      where: { id: integrationAccountId },
      include: { integrationDefinition: true },
    });

    const pat = await this.usersService.getOrCreatePat(
      integrationAccount.integratedById,
      integrationAccount.workspaceId,
    );

    const integrationFunction = await loadRemoteModule(
      getRequires(createAxiosInstance(pat)),
    );

    const integrationDefinition = integrationAccount.integrationDefinition;

    const integration = await integrationFunction(
      `${integrationDefinition.url}/backend/index.js`,
    );

    await integration.run({
      event: IntegrationPayloadEventType.SYNC_INITIAL_TASK,
      eventBody: {
        integrationAccount,
      },
    });
  }
}
