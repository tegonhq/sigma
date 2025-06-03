import { HocuspocusProvider } from '@hocuspocus/provider';
import { SourceType } from '@sol/types';
import Collaboration from '@tiptap/extension-collaboration';
import React from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { IndexeddbPersistence } from 'y-indexeddb';
import * as Y from 'yjs';

import {
  Editor,
  EditorContext,
  EditorExtensions,
  getSocketURL,
  suggestionItems,
} from 'common/editor';
import { TaskExtension } from 'common/editor/task-extension';
import type { PageType, TaskType } from 'common/types';
import { SocketContext } from 'common/wrappers';

import { useUpdateTaskMutation } from 'services/tasks';

import { useContextStore } from 'store/global-context-provider';

interface SingleTaskEditorProps {
  page: PageType;
  task: TaskType;
  onDescriptionChange?: (description: string) => void;
  autoFocus?: boolean;
}

export function SingleTaskEditor({
  page,
  task,
  onDescriptionChange,
  autoFocus,
}: SingleTaskEditorProps) {
  const [provider, setProvider] = React.useState(undefined);
  const [doc, setDoc] = React.useState(undefined);
  const { tasksStore } = useContextStore();
  const { mutate: updateTask } = useUpdateTaskMutation({});
  const socket = React.useContext(SocketContext);

  const debounceUpdateTask = useDebouncedCallback(
    async ({ title, taskId }: { title: string; taskId: string }) => {
      updateTask({
        title,
        taskId,
      });
    },
    500,
  );

  React.useEffect(() => {
    initPageSocket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.id]);

  const initPageSocket = async () => {
    setDoc(undefined);
    setProvider(undefined);
    // To refresh the editor with the new doc a hack
    await new Promise((resolve) => setTimeout(resolve, 100));
    const ydoc = new Y.Doc();

    new IndexeddbPersistence(page.id, ydoc);

    const provider = new HocuspocusProvider({
      url: getSocketURL(),
      name: page.id,
      document: ydoc,
      websocketProvider: socket,
    });
    setDoc(ydoc);
    setProvider(provider);
  };

  if (!provider) {
    return null;
  }

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

  return (
    <div className="flex flex-col min-h-[calc(100vh_-_30vh)]">
      <EditorContext.Provider
        value={{ source: { type: SourceType.TASK, url: task.id } }}
      >
        <Editor
          onChange={onDescriptionChange}
          extensions={[
            Collaboration.configure({
              document: doc,
            }),
            TaskExtension({ update: onTaskExtensionUpdate }),
          ]}
          placeholder="Write notes..."
          autoFocus={autoFocus}
          className="min-h-[calc(100vh_-_30vh)]"
        >
          <EditorExtensions
            suggestionItems={suggestionItems}
          ></EditorExtensions>
        </Editor>
      </EditorContext.Provider>
    </div>
  );
}
