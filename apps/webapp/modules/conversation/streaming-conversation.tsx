import { EditorContent, useEditor } from '@tiptap/react';
import React from 'react';

import { extensionsForConversation } from 'common/editor';

import { skillExtension } from './skill-extension';
import { CustomMention } from './suggestion-extension';
import { useTriggerStream } from './use-trigger-stream';

interface StreamingConversationProps {
  runId: string;
  token: string;
  afterStreaming: () => void;
}

export const StreamingConversation = ({
  runId,
  token,
  afterStreaming,
}: StreamingConversationProps) => {
  const { message, isEnd } = useTriggerStream(runId, token);
  const [loadingText, setLoadingText] = React.useState('Thinking...');

  const loadingMessages = [
    'Thinking...',
    'Loading MCP...',
    'Starting MCP servers...',
    'Still thinking...',
    'Warming up my neural networks...',
    'Consulting my crystal ball...',
    'Teaching hamsters to power the servers...',
    'Bribing the AI gods with cookies...',
    'Untangling quantum spaghetti...',
    'Almost there, just need my morning coffee...',
  ];

  const messagesEditor = useEditor({
    extensions: [...extensionsForConversation, skillExtension, CustomMention],
    editable: false,
    content: '',
  });

  React.useEffect(() => {
    if (message) {
      messagesEditor?.commands.setContent(message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  React.useEffect(() => {
    if (isEnd) {
      afterStreaming();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnd]);

  React.useEffect(() => {
    let currentIndex = 0;
    let delay = 1000; // Start with 1 second

    const updateLoadingText = () => {
      if (!message) {
        setLoadingText(loadingMessages[currentIndex]);
        currentIndex = (currentIndex + 1) % loadingMessages.length;
        delay = Math.min(delay * 1.5, 10000); // Increase delay exponentially up to 5 seconds
        setTimeout(updateLoadingText, delay);
      }
    };

    const timer = setTimeout(updateLoadingText, delay);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  return (
    <div className="flex gap-2 py-4 px-5">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          {message ? (
            <EditorContent
              editor={messagesEditor}
              className="text-foreground"
            />
          ) : (
            <div className="text-foreground italic">{loadingText}</div>
          )}
        </div>
      </div>
    </div>
  );
};
