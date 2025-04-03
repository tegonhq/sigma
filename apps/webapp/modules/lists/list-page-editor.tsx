import { HocuspocusProvider } from '@hocuspocus/provider';
import { SourceType } from '@sigma/types';
import Collaboration from '@tiptap/extension-collaboration';
import React from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { IndexeddbPersistence } from 'y-indexeddb';
import * as Y from 'yjs';

import {
  Editor,
  EditorContextProvider,
  EditorExtensions,
  getSocketURL,
  suggestionItems,
} from 'common/editor';
import { TaskExtension } from 'common/editor/task-extension';
import type { ListType, PageType } from 'common/types';

import { useUpdateTaskMutation } from 'services/tasks';

import { useContextStore } from 'store/global-context-provider';

interface ListPageEditorProps {
  page: PageType;
  list: ListType;
  onDescriptionChange?: (description: string) => void;
  autoFocus?: boolean;
}

export function ListPageEditor({
  page,
  list,
  onDescriptionChange,
  autoFocus,
}: ListPageEditorProps) {
  const [provider, setProvider] = React.useState(undefined);
  const [doc, setDoc] = React.useState(undefined);
  const { tasksStore } = useContextStore();
  const { mutate: updateTask } = useUpdateTaskMutation({});

  // Store a map of taskId -> debounced update functions
  // eslint-disable-next-line @typescript-eslint/ban-types
  const debouncedTaskUpdatesRef = React.useRef<Record<string, Function>>({});

  // Create a function to update a specific task with debouncing
  const updateTaskWithDebounce = React.useCallback(
    (taskId: string, title: string) => {
      // If we don't have a debounced function for this task yet, create one
      if (!debouncedTaskUpdatesRef.current[taskId]) {
        // We'll manually implement debouncing since we can't use the hook in a callback
        let timeoutId: NodeJS.Timeout;
        debouncedTaskUpdatesRef.current[taskId] = (newTitle: string) => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            updateTask({
              title: newTitle,
              taskId,
            });
          }, 500);
        };
      }

      // Call the debounced function
      debouncedTaskUpdatesRef.current[taskId](title);
    },
    [updateTask],
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
      token: '1234',
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
      updateTaskWithDebounce(task.id, newNode.textContent);
    }

    return true;
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh_-_30vh)]">
      <EditorContextProvider source={{ type: SourceType.LIST, id: list.id }}>
        <Editor
          onChange={onDescriptionChange}
          extensions={[
            Collaboration.configure({
              document: doc,
            }),
            TaskExtension({ update: onTaskExtensionUpdate }),
          ]}
          placeholder="Write about the list..."
          autoFocus={autoFocus}
          className="min-h-[calc(100vh_-_30vh)]"
          hasTaskExtension={false}
        >
          <EditorExtensions
            suggestionItems={suggestionItems}
          ></EditorExtensions>
        </Editor>
      </EditorContextProvider>
    </div>
  );
}
