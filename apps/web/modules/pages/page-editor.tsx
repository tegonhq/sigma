import { HocuspocusProvider } from '@hocuspocus/provider';
import {
  Editor,
  EditorExtensions,
  suggestionItems,
} from '@sigma/ui/components/editor/index';
import Collaboration from '@tiptap/extension-collaboration';
import * as Y from 'yjs';

import type { PageType } from 'common/types';

const ydoc = new Y.Doc();

interface PageEditorProps {
  page: PageType;
  onDescriptionChange: (description: string) => void;
}

export function PageEditor({ page, onDescriptionChange }: PageEditorProps) {
  new HocuspocusProvider({
    url: 'ws://localhost:1234',
    name: page.id,
    document: ydoc,
  });

  return (
    <Editor
      value={page.description}
      onChange={onDescriptionChange}
      extensions={[
        Collaboration.configure({
          document: ydoc,
        }),
      ]}
      autoFocus
      className="min-h-[50px] mb-8 px-6 text-md"
    >
      <EditorExtensions suggestionItems={suggestionItems}></EditorExtensions>
    </Editor>
  );
}
