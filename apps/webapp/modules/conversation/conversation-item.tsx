import { UserTypeEnum } from '@sigma/types';
import { cn } from '@tegonhq/ui';
import { EditorContent, useEditor } from '@tiptap/react';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';

import { extensionsForConversation } from 'common/editor';

import { useContextStore } from 'store/global-context-provider';

import { ConversationContext } from './conversation-context';
import { skillExtension } from './skill-extension';
import { CustomMention } from './suggestion-extension';

interface AIConversationItemProps {
  conversationHistoryId: string;
}

export const ConversationItem = observer(
  ({ conversationHistoryId }: AIConversationItemProps) => {
    const { conversationHistoryStore } = useContextStore();

    const conversationHistory =
      conversationHistoryStore.getConversationHistoryForId(
        conversationHistoryId,
      );
    const isUser = conversationHistory.userType === UserTypeEnum.User;

    const id = `a${conversationHistory.id.replace(/-/g, '')}`;

    const editor = useEditor({
      extensions: [...extensionsForConversation, skillExtension, CustomMention],
      editable: false,
      content: conversationHistory.message,
    });

    useEffect(() => {
      editor?.commands.setContent(conversationHistory.message);

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, conversationHistory.message]);

    if (!conversationHistory.message) {
      return null;
    }

    return (
      <div className={cn('flex gap-2 py-0 mx-5', isUser && 'justify-end my-4')}>
        <div
          className={cn(
            'flex flex-col',
            isUser && 'bg-primary/20 p-3 max-w-[500px] rounded-md',
          )}
        >
          <ConversationContext.Provider value={{ conversationHistoryId }}>
            <EditorContent editor={editor} />
          </ConversationContext.Provider>
        </div>
      </div>
    );
  },
);
