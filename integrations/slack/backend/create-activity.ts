import { IntegrationAccount } from '@tegonhq/sigma-sdk';
import axios from 'axios';

import { getChannelDetails, getUserDetails } from './utils';

export const createActivityEvent = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eventBody: any,
  integrationAccount: IntegrationAccount,
) => {
  const { eventData } = eventBody;

  if (eventData.event.type === 'star_added') {
    const event = eventData.event;

    const integrationConfiguration = integrationAccount.integrationConfiguration as Record<
      string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any
    >;
    if (!integrationConfiguration) {
      throw new Error('Integration configuration not found');
    }
    const eventMessage = event.item.message;

    const mentionedUsers = getMentionUsers(event.item.message.text);
    const [userDetails, channelDetails] = await Promise.all([
      getUserDetails([eventMessage.user, ...mentionedUsers], integrationConfiguration.access_token),
      getChannelDetails(event.item.channel, integrationConfiguration.access_token),
    ]);

    const userIdMap = new Map(userDetails.map((user) => [user.id, user]));

    const eventMessageText = eventMessage.text.replace(/<@U\w+>/g, (match: string) => {
      const userId = match.replace(/<@|>/g, '');
      const user = userIdMap.get(userId);
      return user ? `@${user.real_name}|${userId}` : match;
    });

    const text = `Message from user ${userIdMap.get(eventMessage.user)?.real_name}(${eventMessage.user}) in channel ${channelDetails.name}(${channelDetails.id}) at ${eventMessage.ts}. Content: '${eventMessageText}'`;

    const activity = {
      sourceURL: eventMessage.permalink,
      sourceId: eventMessage.ts,
      text,
      integrationAccountId: integrationAccount.id,
      taskId: null,
    };

    await axios.post('/api/v1/activity', activity);
  }
  return { message: `Processed activity from slack` };
};

function getMentionUsers(message: string): string[] {
  const mentionUsers = message.matchAll(/<@U\w+>/g);
  return Array.from(mentionUsers).map((match) => match[0].replace(/<@|>/g, ''));
}
