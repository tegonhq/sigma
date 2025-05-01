import { useState } from 'react';
import { useMutation } from 'react-query';

import { useContextStore } from 'store/global-context-provider';

export function useStreamConversationMutation() {
  const [responses, setResponses] = useState([]);
  const [thoughts, setThoughts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { commonStore } = useContextStore();

  const { mutate, isLoading: apiloading } = useMutation({
    mutationFn: async ({
      conversationHistoryId,
    }: {
      conversationHistoryId: string;
    }) => {
      setResponses([]);

      const response = await fetch(
        `/api/v1/conversation_history/${conversationHistoryId}/stream`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        },
      );

      if (!response.body) {
        throw new Error('ReadableStream not supported in this browser.');
      }

      const reader = response.body.getReader();
      return reader;
    },
    onSuccess: (reader) => {
      setIsLoading(true);
      commonStore.update({ conversationStreaming: true });
      readStream(reader);
    },
  });

  async function readStream(reader: ReadableStreamDefaultReader) {
    async function read() {
      let completed = false;

      // eslint-disable-next-line no-constant-condition
      while (!completed) {
        const { done, value } = await reader.read();
        if (done) {
          setIsLoading(false);
          setThoughts([]);
          setResponses([]);
          commonStore.update({ conversationStreaming: false });

          return;
        }

        const chunk = new TextDecoder('utf-8').decode(value, { stream: true });
        const thoughts: Array<{ type: string }> = [];
        const responses: Array<{ type: string }> = [];
        chunk.split('\n\n').forEach((ch) => {
          try {
            if (ch) {
              const message = JSON.parse(ch.replace('data: ', ''));

              if (message.type.includes('MESSAGE')) {
                responses.push(message.message);
              }

              if (message.type.includes('THOUGHT')) {
                thoughts.push(message.message);
              }

              if (message.type.includes('STREAM_END')) {
                completed = true;
                setIsLoading(false);
                setThoughts([]);
                setResponses([]);
                return;
              }
            }
          } catch (e) {
            completed = true;
            setIsLoading(false);
            setThoughts([]);
            setResponses([]);
            return;
          }

          return undefined;
        });

        setResponses((prevChunk) => [...prevChunk, ...responses]);
        setThoughts((prevChunk) => [...prevChunk, ...thoughts]);
      }
    }

    read();
  }

  return { responses, thoughts, mutate, isLoading: isLoading || apiloading };
}
