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
}: StreamingConversationProps) => {
  const onTaskExtensionUpdate = () => {
    return true;
  };

  const thoughtEditor = useEditor({
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
    thoughtEditor?.commands.setContent(thoughts.join(''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thoughts.length]);

  if (thoughts.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2 border-b border-border py-4 px-5">
      <div className="shrink-0 relative top-[3px]">
        <AI size={16} />
      </div>

      <div className="flex flex-col gap-1">
        <EditorContent
          editor={thoughtEditor}
          className="text-muted-foreground"
        />
      </div>
    </div>
  );
};
