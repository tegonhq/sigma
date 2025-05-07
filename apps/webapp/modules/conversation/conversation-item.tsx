import { UserTypeEnum } from '@sigma/types';
import { cn } from '@tegonhq/ui';
import { EditorContent, useEditor } from '@tiptap/react';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import React, { useEffect } from 'react';

import { extensionsForConversation } from 'common/editor';
import { UserAvatar } from 'common/user-avatar';

import { useContextStore } from 'store/global-context-provider';
import { UserContext } from 'store/user-context';

import { skillExtension } from './skill-extension';
import { CustomMention } from './suggestion-extension';

interface AIConversationItemProps {
  conversationHistoryId: string;
}

export const ConversationItem = observer(
  ({ conversationHistoryId }: AIConversationItemProps) => {
    const { conversationHistoryStore } = useContextStore();
    const user = React.useContext(UserContext);

    const conversationHistory =
      conversationHistoryStore.getConversationHistoryForId(
        conversationHistoryId,
      );

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

    const getIcon = () => {
      if (conversationHistory.userType === UserTypeEnum.User) {
        return <UserAvatar user={user} />;
      }

      return (
        <Image
          src="/logo_light.svg"
          alt="logo"
          key={1}
          width={20}
          height={20}
        />
      );
    };

    if (!conversationHistory.message) {
      return null;
    }

    return (
      <div className={cn('flex gap-2 py-4 mx-5 border-b border-border')}>
        <div className="shrink-0 relative top-[2px]">{getIcon()}</div>

        <div className="flex flex-col">
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  },
);
