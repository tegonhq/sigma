import axios from 'axios';

import { createTasks, getGithubData } from './utils';

export async function syncInitialTasks(eventBody: any) {
  const { integrationAccount } = eventBody;
  const integrationConfiguration = integrationAccount.integrationConfiguration;
  const settings = integrationAccount.settings;

  const queries = [
    `assignee:${settings.login}+type:issue+is:open`,
    `review-requested:${settings.login}+type:pr+is:open`,
    `author:${settings.login}+type:pr+is:open`,
  ];

  const tasks: any = [];

  await Promise.all(
    queries.map(async (query: string) => {
      let page = 1;
      let hasMorePages = true;
      while (hasMorePages) {
        const data = await getGithubData(
          `https://api.github.com/search/issues?page=${page}&per_page=50&q=${query}+created:>=${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`,
          integrationConfiguration.access_token,
        );

        // Check if notifications exists and has data
        if (data.items?.length === 0) {
          hasMorePages = false;
          break;
        }

        data.items.map((item: any) => {
          const url = item.url;
          const sourceId = item.id.toString();
          const status = item.state === 'open' ? 'Todo' : 'Done';
          const title = item.title;

          tasks.push({
            title,
            status,
            source: { type: 'external', extension: 'Github', id: sourceId, url },
            integrationAccountId: integrationAccount.id,
          });

          return true;
        });
        page++;
      }
    }),
  );

  if (tasks.length > 0) {
    await createTasks(tasks);
  }

  await axios.post(`/api/integration_account/${integrationAccount.id}`, {
    settings: { ...settings, lastSyncTime: new Date().toISOString() },
  });
}
