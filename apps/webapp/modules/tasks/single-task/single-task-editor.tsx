import { HocuspocusProvider } from '@hocuspocus/provider';
import { SourceType } from '@sigma/types';
import Collaboration from '@tiptap/extension-collaboration';
import React from 'react';
import * as Y from 'yjs';

import {
  Editor,
  EditorContext,
  EditorExtensions,
  getSocketURL,
  suggestionItems,
} from 'common/editor';
import type { PageType } from 'common/types';

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

  return (
    <div className="flex flex-col min-h-[calc(100vh_-_30vh)]">
      <EditorContext.Provider
        value={{ source: { type: SourceType.PAGE, id: page.id } }}
      >
        <Editor
          onChange={onDescriptionChange}
          extensions={[
            Collaboration.configure({
              document: doc,
            }),
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
