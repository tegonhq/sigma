import { useRealtimeRunWithStreams } from '@trigger.dev/react-hooks';
import React from 'react';

export const useTriggerStream = (runId: string, token: string) => {
  const { error, streams, run } = useRealtimeRunWithStreams(runId, {
    accessToken: token,
    baseURL: 'http://localhost:3030', // Optional if you are using a self-hosted Trigger.dev instance
  });

  const isEnd = React.useMemo(() => {
    if (error) {
      return true;
    }

    if (
      [
        'COMPLETED',
        'CANCELED',
        'FAILED',
        'CRASHED',
        'INTERRUPTED',
        'SYSTEM_FAILURE',
        'EXPIRED',
        'TIMED_OUT',
      ].includes(run?.status)
    ) {
      return true;
    }

    const hasStreamEnd =
      streams.messages &&
      streams.messages.filter((item) => {
        // Check if the item has a type that includes 'MESSAGE_' and is not empty
        return item.type?.includes('STREAM_END');
      });

    if (hasStreamEnd && hasStreamEnd.length > 0) {
      return true;
    }

    return false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run?.status, error, streams.messages?.length]);

  const message = React.useMemo(() => {
    if (!streams?.messages) {
      return '';
    }

    // Filter and combine all message chunks
    return streams.messages
      .filter((item) => {
        // Check if the item has a type that includes 'MESSAGE_' and is not empty
        return item.type?.includes('MESSAGE_');
      })
      .map((item) => item.message)
      .join('');

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streams.messages?.length]);

  return { isEnd, message };
};
