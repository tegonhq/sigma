import axios from 'axios';

export interface ActivityCreate {
  url: string;
  title: string;
  sourceId: string;
  sourceURL: string;
  integrationAccountId: string;
}

export async function createActivity(activity: ActivityCreate[]) {
  for (const act of activity) {
    const existingTask = await getTaskForSource(act.sourceId);
    const { title, url, ...otherAct } = act;

    await axios.post('/api/v1/activity', {
      ...otherAct,
      text: `${title} \n URL: ${url}`,
      taskId: existingTask ? existingTask.id : null,
    });
  }
}

export async function getTaskForSource(sourceId: string) {
  try {
    return (await axios.get(`/api/v1/tasks/source/${sourceId}`, {})).data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return null;
  }
}

export async function getGithubData(url: string, accessToken: string) {
  return (
    await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
  ).data;
}
