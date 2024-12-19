import { HocuspocusProvider } from '@hocuspocus/provider';
import Collaboration from '@tiptap/extension-collaboration';
import getConfig from 'next/config';
import React from 'react';
import * as Y from 'yjs';

import { Editor, EditorExtensions, suggestionItems } from 'common/editor';
import type { PageType } from 'common/types';
const { publicRuntimeConfig } = getConfig();

interface SingleTaskEditorProps {
  page: PageType;
  onDescriptionChange?: (description: string) => void;
  autoFocus?: boolean;
}

export function SingleTaskEditor({
  page,
  onDescriptionChange,
  autoFocus,
}: SingleTaskEditorProps) {
  const [provider, setProvider] = React.useState(undefined);
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
      url: `ws://${publicRuntimeConfig.NEXT_PUBLIC_CONTENT_HOST}`,
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

  return (
    <Editor
      onChange={onDescriptionChange}
      extensions={[
        Collaboration.configure({
          document: doc,
        }),
      ]}
      autoFocus={autoFocus}
      className="min-h-[50px] my-2 text-md"
    >
      <EditorExtensions suggestionItems={suggestionItems}></EditorExtensions>
    </Editor>
  );
}
