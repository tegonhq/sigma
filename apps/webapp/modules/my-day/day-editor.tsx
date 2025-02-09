import { HocuspocusProvider } from '@hocuspocus/provider';
import { PageTypeEnum } from '@sigma/types';
import Collaboration from '@tiptap/extension-collaboration';
import { format } from 'date-fns';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { IndexeddbPersistence } from 'y-indexeddb';
import * as Y from 'yjs';

import {
  Editor,
  EditorExtensions,
  getSocketURL,
  suggestionItems,
} from 'common/editor';
import { AddTaskSelector } from 'common/editor/add-task-selector';
import type { PageType } from 'common/types';

import { useCreatePageMutation } from 'services/pages';

import { useContextStore } from 'store/global-context-provider';

interface DayEditorProps {
  date: Date;
}

interface EditorWithPageProps {
  page: PageType;
}

export const EditorWithPage = observer(({ page }: EditorWithPageProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setProvider] = React.useState(undefined);
  const [doc, setDoc] = React.useState(undefined);

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

  const onDescriptionChange = () => {};

  if (page && doc) {
    return (
      <Editor
        onChange={onDescriptionChange}
        extensions={[
          Collaboration.configure({
            document: doc,
          }),
        ]}
        className="min-h-[calc(100vh_-_65vh)] my-1"
        placeholder="Write notes..."
      >
        <EditorExtensions suggestionItems={suggestionItems}>
          <AddTaskSelector />
        </EditorExtensions>
      </Editor>
    );
  }

  return null;
});

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
      <EditorWithPage page={page} />
    </div>
  );
});
