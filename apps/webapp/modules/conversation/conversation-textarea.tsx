import { Button, cn } from '@redplanethq/ui';
import { Document } from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { EditorContent, CodeBlockLowlight, Placeholder } from 'novel';
import { useCallback, useState } from 'react';
import React from 'react';

import { EditorRoot, lowlight, type EditorT } from 'common/editor';

import { CustomMention, useContextSuggestions } from './suggestion-extension';

interface ConversationTextareaProps {
  onSend: (value: string, agents: string[], title: string) => void;
  defaultValue?: string;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
  onChange?: (text: string) => void;
}

export function ConversationTextarea({
  onSend,
  defaultValue,
  isLoading = false,
  placeholder,
  className,
  onChange,
}: ConversationTextareaProps) {
  const [text, setText] = useState(defaultValue ?? '');
  const [editor, setEditor] = React.useState<EditorT>();
  const [agents, setAgents] = React.useState<string[]>([]);

  const suggestion = useContextSuggestions();

  const onUpdate = (editor: EditorT) => {
    setText(editor.getHTML());

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

  // Memoized send handler
  const handleSend = useCallback(() => {
    if (!editor || !text) {
      return;
    }
    const title = editor.getText();
    onSend(text, agents, title);
    editor.commands.clearContent(true);
    setText('');
  }, [editor, text, agents, onSend]);

  return (
    <div
      className={cn('flex flex-col rounded-md pt-2 bg-transparent', className)}
    >
      <EditorRoot>
        <EditorContent
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          initialContent={defaultValue as any}
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
                return placeholder ?? 'Ask sol...';
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
            onUpdate(editor);
          }}
          shouldRerenderOnTransaction={false}
          editorProps={{
            attributes: {
              class: `prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full`,
            },
            handleKeyDown(view, event) {
              // Block default Enter
              if (event.key === 'Enter' && !event.shiftKey) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const target = event.target as any;

                if (target.innerHTML.includes('suggestion')) {
                  return false;
                }

                event.preventDefault();

                if (text) {
                  handleSend();
                }

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
            'editor-container w-full min-w-full text-base sm:rounded-lg px-3 max-h-[400px] min-h-[40px] overflow-auto',
          )}
        ></EditorContent>
      </EditorRoot>

      <div className={cn('flex justify-end p-2 pt-0 pb-2 items-center')}>
        <Button
          variant="default"
          className="transition-all duration-500 ease-in-out gap-1"
          type="submit"
          size="lg"
          isLoading={isLoading}
          onClick={() => {
            if (text) {
              handleSend();
            }
          }}
        >
          {isLoading ? <>Generating...</> : <>Chat</>}
        </Button>
      </div>
    </div>
  );
}
