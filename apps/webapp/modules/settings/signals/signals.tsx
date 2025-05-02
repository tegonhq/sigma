import { HocuspocusProvider } from '@hocuspocus/provider';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Collaboration from '@tiptap/extension-collaboration';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { IndexeddbPersistence } from 'y-indexeddb';
import * as Y from 'yjs';

import {
  CustomMention,
  useMentionSuggestions,
} from 'modules/conversation/suggestion-extension';

import {
  contextExtensions,
  Editor,
  EditorContextProvider,
  EditorExtensions,
  getSocketURL,
  lowlight,
  suggestionItems,
} from 'common/editor';
import { SocketContext } from 'common/wrappers';

import { useContextStore } from 'store/global-context-provider';

import { SettingSection } from '../setting-section';

export const Signals = observer(() => {
  const { pagesStore } = useContextStore();
  const page = pagesStore.getContextPage();
  const [provider, setProvider] = React.useState(undefined);
  const [doc, setDoc] = React.useState(undefined);
  const socket = React.useContext(SocketContext);
  const suggestion = useMentionSuggestions();

  React.useEffect(() => {
    if (page?.id) {
      initPageSocket();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page?.id]);

  if (!page) {
    return null;
  }

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

      websocketProvider: socket,
    });
    setDoc(ydoc);
    setProvider(provider);
  };

  const onDescriptionChange = () => {};

  if (!provider) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <SettingSection
        title="Context"
        description="Edit user preferences/memory"
      >
        <EditorContextProvider source={{}}>
          <Editor
            onChange={onDescriptionChange}
            extensions={[
              Collaboration.configure({
                document: doc,
              }),
              ...contextExtensions,
              CodeBlockLowlight.configure({
                lowlight,
              }),
              CustomMention.configure({
                suggestion,
              }),
            ]}
            placeholder="Write your preferences."
            autoFocus
            className="px-2"
          >
            <EditorExtensions
              suggestionItems={suggestionItems}
            ></EditorExtensions>
          </Editor>
        </EditorContextProvider>
      </SettingSection>
    </div>
  );
});
