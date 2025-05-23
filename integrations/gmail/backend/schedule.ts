/* eslint-disable dot-notation */
import { IntegrationAccount, IntegrationDefinition } from '@tegonhq/sigma-sdk';
import axios from 'axios';

import { createActivity, getAccessToken } from './utils';

export async function handleSchedule(
  integrationAccount: IntegrationAccount,
  integrationDefinition: IntegrationDefinition,
) {
  const integrationConfiguration = integrationAccount.integrationConfiguration as {
    refresh_token: string;
    redirect_uri: string;
  };
  const accessToken = await getAccessToken(
    integrationDefinition.config.clientId,
    integrationDefinition.config.clientSecret,
    integrationConfiguration.refresh_token,
    integrationConfiguration.redirect_uri,
  );

  const settings = integrationAccount.settings as { lastSyncTime?: string };

  // If lastSyncTime is not available, default to 1 day ago
  const lastSyncTime =
    settings.lastSyncTime || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const unixTimestamp = Math.floor(new Date(lastSyncTime).getTime() / 1000);

  // List messages from inbox after lastSyncTime
  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=in:inbox after:${unixTimestamp} &maxResults=50`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!listRes.ok) {
    throw new Error(`Failed to list messages: ${listRes.statusText}`);
  }

  const listData = await listRes.json();
  const messages = listData.messages || [];

  // 2. Fetch full details for each message
  const emails = [];
  for (const msg of messages) {
    const msgRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    if (msgRes.ok) {
      emails.push(await msgRes.json());
    }
  }

  // 3. Process emails and extract relevant information
  const processedEmails = [];
  let maxTimestamp = 0;

  for (const email of emails) {
    try {
      // Extract message content
      let fullContent = '';
      let sender = '';
      const tags = email.labelIds || [];

      const timestamp = parseInt(email.internalDate, 10);
      if (timestamp > maxTimestamp) {
        maxTimestamp = timestamp;
      }

      // Get sender information from headers
      const fromHeader = email.payload.headers.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (header: any) => header.name.toLowerCase() === 'from',
      );
      if (fromHeader) {
        sender = fromHeader.value;
      }

      // Extract content from the message parts
      if (email.payload.parts) {
        // Try to get HTML content first, then fallback to plain text
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const htmlPart = email.payload.parts.find((part: any) => part.mimeType === 'text/html');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const textPart = email.payload.parts.find((part: any) => part.mimeType === 'text/plain');

        if (htmlPart && htmlPart.body.data) {
          // Decode base64 content
          fullContent = Buffer.from(htmlPart.body.data, 'base64').toString('utf-8');
        } else if (textPart && textPart.body.data) {
          fullContent = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
        }
      } else if (email.payload.body && email.payload.body.data) {
        // Handle single-part messages
        fullContent = Buffer.from(email.payload.body.data, 'base64').toString('utf-8');
      }

      processedEmails.push({
        id: email.id,
        threadId: email.threadId,
        sender,
        tags,
        subject:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          email.payload.headers.find((header: any) => header.name.toLowerCase() === 'subject')
            ?.value || '',
        fullContent,
        timestamp: parseInt(email.internalDate, 10),
      });
    } catch (error) {
      console.error(`Error processing email ${email.id}:`, error);
    }
  }

  // 4. Update the lastSyncTime in settings
  if (maxTimestamp > 0) {
    const newSettings = {
      ...settings,
      lastSyncTime: new Date(maxTimestamp).toISOString(),
    };

    if (processedEmails.length > 0) {
      await createActivity(processedEmails, integrationAccount.id);
    }

    await axios.post(`/api/v1/integration_account/${integrationAccount.id}`, {
      settings: newSettings,
    });
  }

  return { message: `Processed ${processedEmails.length} emails from gmail` };
}
