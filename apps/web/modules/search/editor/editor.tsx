'use client';

import { Button } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { Editor, EditorExtensions, suggestionItems } from 'common/editor';
import { FRONTEND_IPC, SCOPES } from 'common/shortcut-scopes';

import { useIPC } from 'hooks/ipc';
import { useScope } from 'hooks/use-scope';

export const SearchEditor = observer(() => {
  useScope(SCOPES.Search);
  const ipcRenderer = useIPC();

  useHotkeys(
    [Key.Escape],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => {
      console.log('here');
      ipcRenderer.sendMessage(FRONTEND_IPC);
    },
    {
      scopes: [SCOPES.Search],
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
  );

  return (
    <div className="flex flex-col h-full w-full bg-background-2 border border-border rounded-md">
      <Editor
        autoFocus
        className="min-h-[250px] max-h-[250px] overflow-auto text-lg p-6 w-full"
      >
        <EditorExtensions suggestionItems={suggestionItems}></EditorExtensions>
      </Editor>

      <div className="flex justify-end gap-2 p-6">
        <Button variant="secondary">Add to note</Button>
        <Button variant="secondary">Ask AI</Button>
      </div>
    </div>
  );
});
