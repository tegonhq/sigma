import { PageTypeEnum } from '@sigma/types';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useCreatePageMutation } from 'services/pages';
import { useContextStore } from 'store/global-context-provider';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import {
  Editor,
  EditorExtensions,
  suggestionItems,
} from '@sigma/ui/components/editor/index';
import Collaboration from '@tiptap/extension-collaboration';
import { Loader } from '@sigma/ui/components/loader';
import { format } from 'date-fns';

interface DayEditorProps {
  date: Date;
}

export const DayEditor = observer(({ date }: DayEditorProps) => {
  const { pagesStore } = useContextStore();
  const page = pagesStore.getDailyPageWithDate(date);
  const { mutate: createPage } = useCreatePageMutation({});

  const [provider, setProvider] = React.useState(undefined);
  const [doc, setDoc] = React.useState(undefined);
  const dateTitle = format(date, 'dd-MM-yyyy');

  React.useEffect(() => {
    if (!page) {
      createPage({
        sortOrder: pagesStore.getSortOrderForNewPage,
        title: dateTitle,
        type: PageTypeEnum.Daily,
      });
    } else {
      if (!provider) {
        initPageSocket();
      }
    }
  }, [dateTitle, page]);

  const initPageSocket = () => {
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
        value={page?.description}
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

  return (
    <div>
      <Loader />
    </div>
  );
});
