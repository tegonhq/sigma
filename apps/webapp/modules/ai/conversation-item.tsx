import { UserTypeEnum } from '@sigma/types';
import { AI, Button } from '@tegonhq/ui';
import { Editor } from '@tiptap/core';
import { observer } from 'mobx-react-lite';
import getConfig from 'next/config';
import React, { useEffect, useRef } from 'react';

import { defaultExtensions } from 'common/editor';
import type { ConversationHistoryType } from 'common/types';
import { UserAvatar } from 'common/user-avatar';

import { useRunTasksMutation } from 'services/conversations';

import { UserContext } from 'store/user-context';
import { TaskExtension } from 'common/editor/task-extension';
import { useContextStore } from 'store/global-context-provider';
import { useUpdateTaskMutation } from 'services/tasks';
import { useDebouncedCallback } from 'use-debounce';

interface AIConversationItemProps {
  conversationHistory: ConversationHistoryType;
}

const { publicRuntimeConfig } = getConfig();

export const ConversationItem = observer(
  ({ conversationHistory }: AIConversationItemProps) => {
    const { tasksStore } = useContextStore();
    const { mutate: updateTask } = useUpdateTaskMutation({});
    const user = React.useContext(UserContext);
    const id = `a${conversationHistory.id.replace(/-/g, '')}`;
    const editorRef = useRef<Editor | null>(null);
    const { mutate: runTasks } = useRunTasksMutation({});

    const debounceUpdateTask = useDebouncedCallback(
      async ({ title, taskId }: { title: string; taskId: string }) => {
        updateTask({
          title,
          taskId,
        });
      },
      500,
    );

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

    useEffect(() => {
      const element = document.getElementById(id);
      let editor: Editor;

      if (element) {
        editor = new Editor({
          element,
          extensions: [
            ...defaultExtensions,
            TaskExtension({ update: onTaskExtensionUpdate }),
          ],
          editable: false,
          content: conversationHistory.message.replaceAll('\\n', '<br/ >'),
        });
        editorRef.current = editor;
      }
      // Clean up on unmount
      return () => {
        editor && editor.destroy();
      };
    }, [id, conversationHistory.message]);

    const thoughts = JSON.parse(conversationHistory.thoughts);

    const pendingTasks = thoughts ?? thoughts?.pendingTasks ?? [];

    const getIcon = () => {
      if (conversationHistory.userType === UserTypeEnum.User) {
        return <UserAvatar user={user} />;
      }

      return <AI size={16} />;
    };

    return (
      <div className="flex gap-2 border-b border-border py-4 px-5">
        <div className="shrink-0">{getIcon()}</div>

        <div className="flex flex-col">
          <div id={id}></div>
          {pendingTasks && pendingTasks.length > 0 && (
            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  runTasks({
                    baseHost: publicRuntimeConfig.NEXT_PUBLIC_AI_HOST,
                    conversationId: conversationHistory.conversationId,
                    conversationHistoryId: conversationHistory.id,
                    workspaceId: user.workspace.id,
                    taskIds: [],
                  });
                }}
              >
                Execute all
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  },
);
