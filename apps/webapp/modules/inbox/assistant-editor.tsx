import { AI, Button, cn } from '@tegonhq/ui';
import { Command, CommandItem, CommandList } from '@tegonhq/ui';
import { Document } from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { EditorContent, CodeBlockLowlight, Placeholder } from 'novel';
import { useState } from 'react';
import React from 'react';

import {
  CustomMention,
  useMentionSuggestions,
} from 'modules/conversation/suggestion-extension';
import { useSearchCommands } from 'modules/search/command/use-search-commands';

import { EditorRoot, lowlight, type EditorT } from 'common/editor';

interface ConversationTextareaProps {
  onSend: (value: string, agents: string[], title: string) => void;
  defaultValue?: string;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
  onChange?: (text: string) => void;
}

export function AssistantEditor({
  onSend,
  defaultValue,
  isLoading = false,
  placeholder,
  className,
  onChange,
}: ConversationTextareaProps) {
  const [text, setText] = useState(defaultValue ?? '');
  const [html, setHTML] = useState(defaultValue ?? '');
  const [editor, setEditor] = React.useState<EditorT>();
  const [agents, setAgents] = React.useState<string[]>([]);
  const commands = useSearchCommands(text, () => {}, true);

  const suggestion = useMentionSuggestions();

  const onCommentUpdate = (editor: EditorT) => {
    setHTML(editor.getHTML());
    setText(editor.getText());
    onChange && onChange(editor.getText());

    const json = editor.getJSON();

    // Extract agent IDs from mentions
    const mentionAgents: string[] = [];

    // Process JSON to find mention nodes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const processNode = (node: any) => {
      // Check if this is a mention node
      if (node.type === 'mention' && node.attrs && node.attrs.id) {
        mentionAgents.push(node.attrs.id);
      }

      // Recursively process child nodes if they exist
      if (node.content && Array.isArray(node.content)) {
        node.content.forEach(processNode);
      }
    };

    // Start processing from the root
    if (json.content && Array.isArray(json.content)) {
      json.content.forEach(processNode);
    }

    // Update the agents state with the found mention IDs
    setAgents(mentionAgents);
  };

  const pagesCommands = () => {
    const pagesCommands = commands['Pages'];

    if (!pagesCommands || pagesCommands?.length === 0) {
      return null;
    }

    return (
      <>
        <CommandItem
          onSelect={() => {
            onSend(html, agents, text);
            editor.commands.clearContent(true);
            setText('');
          }}
          key={`page__${pagesCommands.length + 1}`}
          className="flex gap-1 items-center py-2 aria-selected:bg-grayAlpha-100"
        >
          <div className="inline-flex items-center gap-2 min-w-[0px]">
            <AI size={16} className="shrink-0" />
            <div className="truncate"> {text} - Chat </div>
          </div>
        </CommandItem>
        {pagesCommands.splice(0, 5).map((command, index: number) => {
          return (
            <CommandItem
              onSelect={command.command}
              key={`page__${index}`}
              className="flex gap-1 items-center py-2 aria-selected:bg-grayAlpha-100"
            >
              <div className="inline-flex items-center gap-2 min-w-[0px]">
                <command.Icon size={16} className="shrink-0" />
                <div className="truncate"> {command.text}</div>
              </div>
            </CommandItem>
          );
        })}
      </>
    );
  };

  return (
    <Command className="rounded-lg border bg-background-2 mt-0 w-full p-1 rounded-xl shadow border-gray-300 border-1 !h-auto">
      <div
        className={cn(
          'flex flex-col rounded-md pt-1 bg-transparent',
          className,
        )}
      >
        <EditorRoot>
          <EditorContent
            initialContent={{
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: defaultValue,
                    },
                  ],
                },
              ],
            }}
            extensions={[
              Document,
              Paragraph,
              Text,
              CustomMention.configure({
                suggestion,
              }),
              CodeBlockLowlight.configure({
                lowlight,
              }),
              HardBreak.configure({
                keepMarks: true,
              }),
              Placeholder.configure({
                placeholder: () => {
                  return placeholder ?? 'Ask sigma...';
                },
                includeChildren: true,
              }),
            ]}
            onCreate={async ({ editor }) => {
              setEditor(editor);
              await new Promise((resolve) => setTimeout(resolve, 100));

              editor.commands.focus('end');
            }}
            onUpdate={({ editor }) => {
              onCommentUpdate(editor);
            }}
            shouldRerenderOnTransaction={false}
            editorProps={{
              attributes: {
                class: `prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full`,
              },
              handleKeyDown(view, event) {
                // Block default Enter
                if (event.key === 'Enter' && !event.shiftKey) {
                  const mentionItem = document.querySelector(
                    '[data-selected="true"]',
                  ) as HTMLElement;

                  if (mentionItem) {
                    mentionItem.click();
                  }

                  const activeItem = document.querySelector(
                    '[aria-selected="true"]',
                  ) as HTMLElement;

                  activeItem?.click();
                  return true;
                }

                // Allow Shift+Enter to insert hard break
                if (event.key === 'Enter' && event.shiftKey) {
                  view.dispatch(
                    view.state.tr.replaceSelectionWith(
                      view.state.schema.nodes.hardBreak.create(),
                    ),
                  );
                  return true;
                }

                return false;
              },
            }}
            immediatelyRender={false}
            className={cn(
              'editor-container w-full min-w-full text-base sm:rounded-lg px-3 max-h-[400px] min-h-[30px] overflow-auto',
            )}
          ></EditorContent>
        </EditorRoot>
      </div>

      <CommandList className="p-2 pt-0 pb-2">
        {text && text.slice(-1) !== '@' && pagesCommands()}

        <div className={cn('flex justify-end pt-2 items-center')}>
          <Button
            variant="default"
            className="transition-all duration-500 ease-in-out gap-1"
            type="submit"
            size="lg"
            isLoading={isLoading}
            onClick={() => {
              if (html) {
                const title = editor.getText();

                onSend(html, agents, title);
                editor.commands.clearContent(true);
                setText('');
              }
            }}
          >
            {isLoading ? <>Generating...</> : <>Chat ↵</>}
          </Button>
        </div>
      </CommandList>
    </Command>
  );
}
