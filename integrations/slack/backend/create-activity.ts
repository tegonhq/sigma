import { IntegrationAccount } from '@tegonhq/sigma-sdk';
import axios from 'axios';

export const createActivityEvent = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eventBody: any,
  integrationAccount: IntegrationAccount,
) => {
  const { eventData } = eventBody;

  if (eventData.event.type === 'star_added') {
    const message = eventData.event.item.message;

    const activity = {
      sourceURL: message.permalink,
      sourceId: message.ts,
      text: message.text,
      integrationAccountId: integrationAccount.id,
      taskId: null,
    };

    await axios.post('/api/v1/activity', activity);
  }
  return { message: `Processed activity from slack` };
};
