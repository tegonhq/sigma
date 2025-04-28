import { HocuspocusProvider } from '@hocuspocus/provider';
import { PageTypeEnum, SourceType } from '@sigma/types';
import Collaboration from '@tiptap/extension-collaboration';
import { format } from 'date-fns';
import { observer } from 'mobx-react-lite';
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
import { AddTaskSelector } from 'common/editor/add-task-selector';
import { TaskExtension } from 'common/editor/task-extension';
import type { PageType } from 'common/types';
import { SocketContext } from 'common/wrappers';

import { useCreatePageMutation } from 'services/pages';
import { useUpdateTaskMutation } from 'services/tasks';

import { useContextStore } from 'store/global-context-provider';

interface DayEditorProps {
  date: Date;
  onChange: () => void;
}

interface EditorWithPageProps {
  page: PageType;
  date: Date;
  onChange?: () => void;
}

export const EditorWithPage = observer(
  ({ page, date, onChange }: EditorWithPageProps) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [provider, setProvider] =
      React.useState<HocuspocusProvider>(undefined);
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

    React.useEffect(() => {
      return () => {
        if (provider) {
          provider.destroy();
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const initPageSocket = async () => {
      setDoc(undefined);
      setProvider(undefined);
      // To refresh the editor with the new doc a hack
      await new Promise((resolve) => setTimeout(resolve, 50));
      const ydoc = new Y.Doc();

      new IndexeddbPersistence(page.id, ydoc);

      const provider = new HocuspocusProvider({
        url: getSocketURL(),
        name: page.id,
        document: ydoc,
        token: '',
        websocketProvider: socket,
      });

      setDoc(ydoc);
      setProvider(provider);
    };

    const onDescriptionChange = () => {
      onChange();
    };

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

    if (page && doc) {
      return (
        <EditorContext.Provider
          value={{ source: { type: SourceType.PAGE, id: page.id }, date }}
        >
          <Editor
            onChange={onDescriptionChange}
            extensions={[
              Collaboration.configure({
                document: doc,
              }),
              TaskExtension({ update: onTaskExtensionUpdate }),
            ]}
            className="min-h-[calc(100vh_-_65vh)] my-1"
            placeholder="Write notes..."
          >
            <EditorExtensions suggestionItems={suggestionItems}>
              <AddTaskSelector />
            </EditorExtensions>
          </Editor>
        </EditorContext.Provider>
      );
    }

    return null;
  },
);

export const DayEditor = observer(({ date, onChange }: DayEditorProps) => {
  const { mutate: createPage } = useCreatePageMutation({});
  const { pagesStore } = useContextStore();
  const page = pagesStore.getDailyPageWithDate(date);
  const dateTitle = format(date, 'dd-MM-yyyy');

  React.useEffect(() => {
    if (!page) {
      createPage({
        sortOrder: '',
        title: dateTitle,
        type: PageTypeEnum.Daily,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateTitle, page]);

  if (!page) {
    return null;
  }

  return <EditorWithPage page={page} date={date} onChange={onChange} />;
});
