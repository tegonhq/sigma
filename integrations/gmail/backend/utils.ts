import axios from 'axios';

export const getAccessToken = async (
  clientId: string,
  clientSecret: string,
  refreshToken: string,
  redirectURL: string,
) => {
  const accessResponse = await axios.post(
    'https://oauth2.googleapis.com/token',
    {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      redirect_uri: redirectURL,
    },
    { headers: {} },
  );

  return accessResponse.data.access_token;
};

export interface ProcessedEmail {
  id: string;
  threadId: string;
  sender: string;
  tags: string[];
  subject: string;
  fullContent: string;
  timestamp: number;
}

export async function createActivity(emails: ProcessedEmail[], integrationAccountId: string) {
  for (const email of emails) {
    const existingTask = await getTaskForSource(email.id);

    const { threadId, sender, tags, subject, fullContent, timestamp } = email;

    const text = `Email received from ${sender} with subject ${subject}. \n\n Content: ${fullContent} \n\n Labels: ${tags.join(',')}, Timestamp: ${timestamp}, ThreadId: ${threadId}`;

    await axios.post('/api/v1/activity', {
      sourceId: email.id,
      sourceURL: `https://mail.google.com/mail/u/0/#all/${email.id}`,
      text,
      taskId: existingTask ? existingTask.id : null,
      integrationAccountId,
    });
  }
}

export async function getTaskForSource(sourceId: string) {
  try {
    return (await axios.get(`/api/v1/tasks/source/${sourceId}`, {})).data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  } catch (e: any) {
    return null;
  }
}
