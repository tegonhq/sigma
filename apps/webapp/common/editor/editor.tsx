/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Editor as EditorT, Extension, Mark, Node } from '@tiptap/core';

import { cn, Separator } from '@tegonhq/ui';
import { EditorInstance, EditorContent, EditorBubble, useEditor } from 'novel';
import {
  ImageResizer,
  handleCommandNavigation,
  type SuggestionItem,
} from 'novel/extensions';
import * as React from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { defaultExtensions, getPlaceholder } from './editor-extensions';
import { LinkSelector, NodeSelector, TextButtons } from './selectors';
import { slashCommand } from './slash-command';
import {
  createTasksExtension,
  handleMarkAndImagePaste,
  uploadFn,
} from './utils';
import {
  EditorRoot,
  EditorCommand,
  EditorCommandItem,
  EditorCommandEmpty,
} from './utils/index';

interface EditorExtensionsProps {
  suggestionItems: SuggestionItem[];
  children?: React.ReactNode;
}

export const EditorExtensions = ({
  suggestionItems,
  children,
}: EditorExtensionsProps) => {
  const [openNode, setOpenNode] = React.useState(false);
  const [openLink, setOpenLink] = React.useState(false);

  return (
    <>
      <EditorCommand
        className={cn(
          'font-sans w-52 bg-background-2 backdrop-blur-md pl-1 shadow-1 border border-[#ffffff38] transition-all flex flex-col',
        )}
      >
        <EditorCommandEmpty className="px-2 text-muted-foreground">
          No results
        </EditorCommandEmpty>

        {suggestionItems.map((item: SuggestionItem) => (
          <EditorCommandItem
            value={item.title}
            onCommand={(val) => item.command(val)}
            className={`flex w-full items-center space-x-2 my-1 rounded px-2 py-1 text-left hover:bg-accent aria-selected:bg-accent hover:text-accent-foreground aria-selected:text-accent-foreground`}
            key={item.title}
          >
            <div className="flex h-4 w-4 items-center justify-center">
              {item.icon}
            </div>
            <div>
              <p>{item.title}</p>
            </div>
          </EditorCommandItem>
        ))}
      </EditorCommand>

      <EditorBubble className="flex w-fit items-center max-w-[90vw] overflow-hidden rounded bg-background-2 shadow-1 border-[#ffffff38] p-1">
        <Separator orientation="vertical" />
        <NodeSelector open={openNode} onOpenChange={setOpenNode} />
        <Separator orientation="vertical" />
        <LinkSelector open={openLink} onOpenChange={setOpenLink} />
        <Separator orientation="vertical" />
        <TextButtons />
        {children && (
          <>
            <Separator orientation="vertical" />
            {children}
          </>
        )}
      </EditorBubble>
    </>
  );
};

interface EditorProps {
  value?: string;
  onChange?: (value: string, valueString?: string) => void;
  autoFocus?: boolean;
  className?: string;
  editorClassName?: string;
  placeholder?: string | Extension;
  editable?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmit?: () => void;
  onCreate?: (editor: EditorT) => void;
  handlePaste?: (editor: EditorT, event: ClipboardEvent) => boolean;

  readonly children: React.ReactNode;
  extensions?: Array<Mark<any, any> | Node<any, any> | Extension<any, any>>;
}

export const Editor = ({
  value,
  onChange,
  autoFocus = false,
  className,
  editorClassName,
  placeholder,
  onFocus,
  onBlur,
  onCreate,
  children,
  extensions = [],
  editable = true,
  handlePaste,
}: EditorProps) => {
  const [editor, setEditor] = React.useState<EditorT>();

  function getInitialValue() {
    try {
      const parsedValue = JSON.parse(value);
      if (parsedValue) {
        return parsedValue.json ?? parsedValue;
      }
      return undefined;
    } catch (e) {
      // Do this because sometimes you will just have text
      return value;
    }
  }

  React.useEffect(() => {
    if (value === undefined && editor) {
      editor.commands.clearContent(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const debouncedUpdates = useDebouncedCallback(
    async (editor: EditorInstance) => {
      const json = editor.getJSON();

      createTasksExtension(editor);

      onChange &&
        onChange(
          JSON.stringify({
            json,
            text: editor.getText(),
          }),
        );
    },
    500,
  );

  const getExtensions = () => {
    const finalExtensions = [
      ...defaultExtensions,
      slashCommand,
      getPlaceholder(placeholder),
      ...extensions,
    ];

    return finalExtensions;
  };

  const focus = () => {
    onFocus && onFocus();
  };

  return (
    // TODO: Change this to the editor input
    <div onFocus={focus} onBlur={onBlur} className="relative w-full">
      <EditorRoot>
        <EditorContent
          initialContent={getInitialValue()}
          extensions={getExtensions()}
          shouldRerenderOnTransaction={false}
          immediatelyRender={false}
          className={cn(
            'editor-container w-full min-w-full text-base sm:rounded-lg',
            className,
          )}
          onCreate={async ({ editor }) => {
            setEditor(editor);

            if (onCreate) {
              onCreate(editor);
            }

            await new Promise((resolve) => setTimeout(resolve, 100));

            autoFocus && editor.commands.focus('end');
          }}
          editorProps={{
            handlePaste: (_, event) => {
              const pasteResponse = handlePaste && handlePaste(editor, event);

              if (!pasteResponse) {
                return handleMarkAndImagePaste(editor, event, uploadFn);
              }

              return pasteResponse;
            },

            handleDOMEvents: {
              keydown: (_view, event) => {
                if (event.key === 'Escape') {
                  return editor.commands.blur();
                }
                return handleCommandNavigation(event);
              },
            },
            editable: () => editable,
            attributes: {
              class: `prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full ${editorClassName}`,
            },
          }}
          onUpdate={({ editor }) => {
            debouncedUpdates(editor);
          }}
          slotAfter={<ImageResizer />}
        >
          {children}
        </EditorContent>
      </EditorRoot>
    </div>
  );
};

export type { EditorT };
export { EditorBubble, useEditor };
export type { SuggestionItem };
