import { HocuspocusProvider } from '@hocuspocus/provider';
import { PageTypeEnum } from '@sigma/types';
import Collaboration from '@tiptap/extension-collaboration';
import { format } from 'date-fns';
import { observer } from 'mobx-react-lite';
import React from 'react';
import * as Y from 'yjs';

import { Editor, EditorExtensions, suggestionItems } from 'common/editor';
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

    const provider = new HocuspocusProvider({
      url: 'ws://localhost:1234',
      name: page?.id,
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
        autoFocus
        className="min-h-[50px] my-2 text-md"
      >
        <EditorExtensions suggestionItems={suggestionItems}></EditorExtensions>
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

  return <EditorWithPage page={page} />;
});
