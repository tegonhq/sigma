import { AI } from '@tegonhq/ui';
import { EditorContent, useEditor } from '@tiptap/react';
import React from 'react';

import { extensionsForConversation } from 'common/editor';
import { TaskExtension } from 'common/editor/task-extension';

import { skillExtension } from './skill-extension';
import { CustomMention } from './suggestion-extension';

interface StreamingConversationProps {
  thoughts: string[];
  messages: string[];
}

export const StreamingConversation = ({
  thoughts,
  messages,
}: StreamingConversationProps) => {
  const onTaskExtensionUpdate = () => {
    return true;
  };

  const messagesEditor = useEditor({
    extensions: [
      ...extensionsForConversation,
      TaskExtension({ update: onTaskExtensionUpdate }),
      skillExtension,
      CustomMention,
    ],
    editable: false,
    content: thoughts.join(''),
  });

  React.useEffect(() => {
    messagesEditor?.commands.setContent(messages.join(''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2 py-4 px-5">
      <div className="shrink-0 relative top-[3px]">
        <AI size={16} />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <EditorContent editor={messagesEditor} className="text-foreground" />
        </div>
      </div>
    </div>
  );
};
