import { LLMMappings } from '@redplanethq/sol-sdk';
import { logger } from '@trigger.dev/sdk/v3';
import axios from 'axios';

import { SOL_MEMORY_EXTRACTION } from './prompt';
import { generate } from './stream-utils';

export const addToMemory = async (
  conversationId: string,
  message: string,
  agentMessage: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  preferences: any,
  userName: string,
) => {
  const memoryHost = preferences.memory_host;
  const apiKey = preferences.memory_api_key;

  if (!memoryHost || !apiKey) {
    logger.error('Memory is not configured');
    return 'Memory is not configured';
  }

  // Create episodeBody in string format
  const episodeBody = `user(${userName}): ${message}\nassistant: ${agentMessage}`;

  let responseText = '';

  await generate(
    [
      { role: 'system', content: SOL_MEMORY_EXTRACTION },
      { role: 'user', content: episodeBody },
    ],
    (text) => {
      responseText = text;
    },
    undefined,
    undefined,
    LLMMappings.GPT41,
  );

  const outputMatch = responseText.match(/<output>\s*(.*?)\s*<\/output>/s);
  const memoryString =
    outputMatch && outputMatch[1] ? outputMatch[1].trim() : '';

  if (memoryString !== 'NOTHING_TO_REMEMBER') {
    const response = await axios.post(
      `${memoryHost}/ingest`,
      {
        episodeBody: responseText,
        referenceTime: new Date().toISOString(),
        metadata: {
          type: 'Conversation',
        },
        source: 'sol',
        sessionId: conversationId,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      },
    );

    return response.data;
  }

  return 'NOTHING_TO_REMEMBER';
};
