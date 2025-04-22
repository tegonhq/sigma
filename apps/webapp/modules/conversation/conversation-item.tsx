import { UserTypeEnum } from '@sigma/types';
import { AI } from '@tegonhq/ui';
import { EditorContent, useEditor } from '@tiptap/react';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { extensionsForConversation } from 'common/editor';
import { TaskExtension } from 'common/editor/task-extension';
import { UserAvatar } from 'common/user-avatar';

import { useUpdateTaskMutation } from 'services/tasks';

import { useContextStore } from 'store/global-context-provider';
import { UserContext } from 'store/user-context';

import { skillExtension } from './skill-extension';
import { CustomMention } from './suggestion-extension';

interface AIConversationItemProps {
  conversationHistoryId: string;
}

export const ConversationItem = observer(
  ({ conversationHistoryId }: AIConversationItemProps) => {
    const { tasksStore, conversationHistoryStore } = useContextStore();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onTaskExtensionUpdate = ({ newNode }: any) => {
      const task = tasksStore.getTaskWithId(newNode.attrs.id);
      if (task) {
        debounceUpdateTask({
          title: newNode.textContent,
          taskId: task.id,
        });
      }

      return true;
    };

    const conversationHistory =
      conversationHistoryStore.getConversationHistoryForId(
        conversationHistoryId,
      );
    const { mutate: updateTask } = useUpdateTaskMutation({});
    const user = React.useContext(UserContext);
    const id = `a${conversationHistory.id.replace(/-/g, '')}`;

    const editor = useEditor({
      extensions: [
        ...extensionsForConversation,
        TaskExtension({ update: onTaskExtensionUpdate }),
        skillExtension,
        CustomMention,
      ],
      editable: false,
      content: conversationHistory.message,
    });

    const debounceUpdateTask = useDebouncedCallback(
      async ({ title, taskId }: { title: string; taskId: string }) => {
        updateTask({
          title,
          taskId,
        });
      },
      500,
    );

    useEffect(() => {
      editor?.commands.setContent(conversationHistory.message);

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, conversationHistory.message]);

    const getIcon = () => {
      if (conversationHistory.userType === UserTypeEnum.User) {
        return <UserAvatar user={user} />;
      }

      return <AI size={16} />;
    };

    return (
      <div className="flex gap-2 border-b border-border py-4 px-5">
        <div className="shrink-0 relative top-[3px]">{getIcon()}</div>

        <div className="flex flex-col">
          <EditorContent editor={editor} />
        </div>
      </div>
    );
  },
);
