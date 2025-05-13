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

  const messagesEditor = useEditor({
    extensions: [...extensionsForConversation, skillExtension, CustomMention],
    editable: false,
    content: '',
  });

  React.useEffect(() => {
    messagesEditor?.commands.setContent(message);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  React.useEffect(() => {
    if (isEnd) {
      afterStreaming();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnd]);

  return (
    <div className="flex gap-2 py-4 px-5">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <EditorContent editor={messagesEditor} className="text-foreground" />
        </div>
      </div>
    </div>
  );
};
