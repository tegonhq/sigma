import {
  Editor,
  EditorExtensions,
  suggestionItems,
} from '@sigma/ui/components/editor/index';
import Collaboration from '@tiptap/extension-collaboration';
import * as Y from 'yjs';

import type { PageType } from 'common/types';
import { HocuspocusProvider } from '@hocuspocus/provider';
import React from 'react';
import { Loader } from '@sigma/ui/components/loader';

interface PageEditorProps {
  page: PageType;
  onDescriptionChange: (description: string) => void;
}

export function PageEditor({ page, onDescriptionChange }: PageEditorProps) {
  const [provider, setProvider] = React.useState(undefined);
  const [doc, setDoc] = React.useState(undefined);

  React.useEffect(() => {
    initPageSocket();
  }, [page]);

  const initPageSocket = () => {
    const ydoc = new Y.Doc();

    const provider = new HocuspocusProvider({
      url: 'ws://localhost:1234',
      name: page.id,
      document: ydoc,
      token: '1234',
    });

    setDoc(ydoc);
    setProvider(provider);
  };

  if (!provider) {
    return <Loader />;
  }

  return (
    <Editor
      value={page.description}
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
