import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createActivity = async (eventBody: any) => {
  if (eventBody.type === 'url_verification') {
    return { challenge: eventBody.challenge };
  }

  console.log(eventBody);

  // Determine activity type and name based on GitHub event
  let activityType = 'github_event';
  let activityName = 'GitHub Event';

  if (eventBody.pull_request) {
    activityType = `github_pull_request_${eventBody.action}`;
    activityName = `PR ${eventBody.action}: ${eventBody.pull_request.title}`;
  } else if (eventBody.issue) {
    activityType = `github_issue_${eventBody.action}`;
    activityName = `Issue ${eventBody.action}: ${eventBody.issue.title}`;
  }

  const accountId = eventBody.installation.id.toString();

  const integrationAccount = await prisma.integrationAccount.findFirst({
    where: { accountId, deleted: null },
  });

  await prisma.activity.create({
    data: {
      type: activityType,
      name: activityName,
      eventData: eventBody,
      workspaceId: integrationAccount.workspaceId,
      integrationAccountId: integrationAccount.id,
    },
  });

  return true;
};
