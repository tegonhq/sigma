import axios from 'axios';

import { createTasks, getGithubData } from './utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handleSchedule(eventBody: any) {
  const { integrationAccount } = eventBody;
  const integrationConfiguration = integrationAccount.integrationConfiguration;
  const settings = integrationAccount.settings;

  if (!settings?.lastSyncTime) {
    return {
      message: `No last sync time in settings of integration account ${integrationAccount.id}`,
    };
  }

  const lastSyncTime = settings.lastSyncTime;

  const allowedReasons = [
    'assign',
    'review_requested',
    'mention',
    'state_change',
    'subscribed',
    'author',
  ];

  let page = 1;
  let hasMorePages = true;
  let notificationCount = 0;

  while (hasMorePages) {
    const notifications = await getGithubData(
      `https://api.github.com/notifications?page=${page}&per_page=50&all=true&since=${lastSyncTime}`,
      integrationConfiguration.access_token,
    );

    // Check if notifications exists and has data
    if (notifications.length === 0) {
      hasMorePages = false;
      break;
    }
    page++;

    const filteredNotifications = notifications.filter((notification: any) =>
      allowedReasons.includes(notification.reason),
    );

    notificationCount += filteredNotifications?.length || 0;

    const tasks: any = [];

    await Promise.all(
      filteredNotifications.map(async (notification: any) => {
        const { reason, subject } = notification;

        let url: string = '';
        let hasTask: boolean = false;
        let sourceId: string = '';
        let status = 'Todo';
        let title: string = '';
        let subjectType: string = '';
        let githubData: Record<string, any> = {};
        switch (reason) {
          // case 'mention':
          //   url = subject.latest_comment_url;
          //   subjectType = subject.type.toLowerCase();
          //   hasTask = false;
          //   githubData = await getGithubData(url, integrationConfiguration.access_token);
          //   break;

          case 'assign':
            url = subject.url;
            subjectType = subject.type.toLowerCase();
            hasTask = true;
            githubData = await getGithubData(url, integrationConfiguration.access_token);
            sourceId = githubData.id.toString();
            status = githubData.state === 'open' ? 'Todo' : 'Done';
            title = `#${githubData.number} - ${githubData.title}`;
            break;

          case 'review_requested':
            url = subject.url;
            subjectType = subject.type.toLowerCase();
            hasTask = true;
            githubData = await getGithubData(url, integrationConfiguration.access_token);
            sourceId = githubData.id.toString();
            status = eventBody.merged ? 'Todo' : 'Done';
            title = `#${githubData.number} - ${githubData.title}`;
            break;

          case 'state_change':
            url = subject.url;
            subjectType = subject.type.toLowerCase();
            hasTask = true;
            githubData = await getGithubData(url, integrationConfiguration.access_token);
            sourceId = githubData.id.toString();
            status =
              subjectType === 'issue'
                ? githubData.state === 'open'
                  ? 'Todo'
                  : 'Done'
                : eventBody.merged
                  ? 'Todo'
                  : 'Done';
            title = `#${githubData.number} - ${githubData.title}`;
            break;

          case 'subscribed':
            url = subject.url;
            subjectType = subject.type.toLowerCase();
            hasTask = true;
            githubData = await getGithubData(url, integrationConfiguration.access_token);
            sourceId = githubData.id.toString();
            status =
              subjectType === 'issue'
                ? githubData.state === 'open'
                  ? 'Todo'
                  : 'Done'
                : eventBody.merged
                  ? 'Todo'
                  : 'Done';
            title = `#${githubData.number} - ${githubData.title}`;
            break;

          case 'author':
            url = subject.url;
            subjectType = subject.type.toLowerCase();
            hasTask = true;
            githubData = await getGithubData(url, integrationConfiguration.access_token);
            sourceId = githubData.id.toString();
            status = eventBody.merged ? 'Todo' : 'Done';
            title = `#${githubData.number} - ${githubData.title}`;
            break;

          default:
            break;
        }

        if (url) {
          if (hasTask) {
            tasks.push({
              url,
              title,
              status,
              sourceId,
              integrationAccountId: integrationAccount.id,
            });
          }
        }
      }),
    );

    if (tasks.length > 0) {
      await createTasks(tasks);
    }

    await axios.post(`/api/v1/integration_account/${integrationAccount.id}`, {
      settings: { ...settings, lastSyncTime: new Date().toISOString() },
    });
  }

  return { message: `Processed ${notificationCount} notifications from github` };
}
