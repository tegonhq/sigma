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

import { useCreatePageMutation, useUpdatePageMutation } from 'services/pages';

import { useContextStore } from 'store/global-context-provider';

interface DayEditorProps {
  date: Date;
}

interface EditorWithPageProps {
  page: PageType;
  date: Date;
}

export const EditorWithPage = observer(
  ({ page, date }: EditorWithPageProps) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, setProvider] = React.useState<HocuspocusProvider>(undefined);
    const [doc, setDoc] = React.useState(undefined);
    const { tasksStore } = useContextStore();
    const { mutate: updatePage } = useUpdatePageMutation({});

    const debounceUpdateTask = useDebouncedCallback(
      async ({ title, pageId }: { title: string; pageId: string }) => {
        updatePage({
          title,
          pageId,
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
      await new Promise((resolve) => setTimeout(resolve, 50));
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

    const onDescriptionChange = () => {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onTaskExtensionUpdate = ({ newNode }: any) => {
      const task = tasksStore.getTaskWithId(newNode.attrs.id);
      if (task) {
        debounceUpdateTask({
          title: newNode.textContent,
          pageId: task.pageId,
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

export const DayEditor = observer(({ date }: DayEditorProps) => {
  const { mutate: createPage } = useCreatePageMutation({});
  const { pagesStore } = useContextStore();
  const page = pagesStore.getDailyPageWithDate(date);
  const dateTitle = format(date, 'dd-MM-yyyy');

  React.useEffect(() => {
    if (!page) {
      createPage({
        sortOrder: pagesStore.getSortOrderForNewPage,
        title: dateTitle,
        type: PageTypeEnum.Daily,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateTitle, page]);

  if (!page) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh_-_65vh)]">
      <EditorWithPage page={page} date={date} />
    </div>
  );
});
