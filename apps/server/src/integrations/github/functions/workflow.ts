import { PrismaClient } from '@prisma/client';
import { IntegrationEventPayload, JsonObject } from '@sigma/types';

import { getAllFilesAndRead } from './read_files';
import { getToken } from '../get-token';
import { createDocuments } from './document';
import { storeDocuments } from './store';

const prisma = new PrismaClient();

export default async function indexRepo(eventPayload: IntegrationEventPayload) {
  const { owner, repoName, integrationAccount, workspaceId } = eventPayload;
  const sourceId = `${owner}/${repoName}`;

  // Find existing job
  const existingJob = await prisma.indexJob.findFirst({
    where: {
      sourceId,
      integrationAccountId: integrationAccount.id,
      workspaceId,
      deleted: null,
    },
  });

  // Either update existing job or create new one
  const indexJob = existingJob
    ? await prisma.indexJob.update({
        where: { id: existingJob.id },
        data: {
          status: 'IN_PROGRESS',
          metadata: { repository: repoName, owner },
        },
      })
    : await prisma.indexJob.create({
        data: {
          type: 'CODE',
          status: 'IN_PROGRESS',
          sourceId,
          metadata: { repository: repoName, owner },
          integrationAccountId: integrationAccount.id,
          workspaceId,
        },
      });
  try {
    const tokens = await getToken(integrationAccount.id);
    const files = await getAllFilesAndRead(owner, repoName, '', tokens.token);
    console.log(files);
    const documents = await createDocuments(
      files,
      owner,
      repoName,
      tokens.token,
    );

    console.log(documents);
    await storeDocuments(documents, indexJob.id);

    // Update job status to completed
    await prisma.indexJob.update({
      where: { id: indexJob.id },
      data: { status: 'COMPLETED' },
    });
  } catch (error) {
    if (indexJob) {
      await prisma.indexJob.update({
        where: { id: indexJob.id },
        data: {
          status: 'FAILED',
          metadata: {
            error: error.message,
            ...(indexJob.metadata as JsonObject),
          },
        },
      });
    }
    throw error;
  }
}
