import axios from 'axios';

export interface ActivityCreate {
  url: string;
  text: string;
  sourceId: string;
  sourceURL: string;
  integrationAccountId: string;
}

export async function getSlackTeamInfo(slackTeamId: string, accessToken: string) {
  const response = await axios.get(`https://slack.com/api/team.info?team=${slackTeamId}`, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
}
