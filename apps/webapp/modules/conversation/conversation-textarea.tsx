import { Button, cn, SendLine } from '@tegonhq/ui';
import { Document } from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { EditorContent } from 'novel';
import { CodeBlockLowlight, Placeholder } from 'novel/extensions';
import { useState } from 'react';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { EditorRoot, lowlight, type EditorT } from 'common/editor';
import { SCOPES } from 'common/shortcut-scopes';

import { CustomMention, useMentionSuggestions } from './suggestion-extension';

interface ConversationTextareaProps {
  onSend: (value: string, agents: string[], title: string) => void;
}

export function ConversationTextarea({ onSend }: ConversationTextareaProps) {
  const [text, setText] = useState('');
  const [editor, setEditor] = React.useState<EditorT>();
  const [agents, setAgents] = React.useState<string[]>([]);

  const suggestion = useMentionSuggestions();

  useHotkeys(
    [Key.Enter],
    () => {
      if (text) {
        const title = editor.getText();

        onSend(text, agents, title);
        setText('');
        editor.commands.clearContent(true);
      }
    },
    {
      scopes: [SCOPES.AI],
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
  );

  const onCommentUpdate = (editor: EditorT) => {
    setText(editor.getHTML());
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

  return (
    <div className="p-4">
      <div className="flex flex-col rounded pt-2 bg-background">
        <EditorRoot>
          <EditorContent
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
                  return 'Ask sigma...';
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
                  event.preventDefault();
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
              'editor-container w-full min-w-full text-base sm:rounded-lg px-3 max-h-[400px] overflow-auto',
            )}
          ></EditorContent>
        </EditorRoot>

        <div className={cn('flex justify-end p-2 pt-0 pb-2 items-center')}>
          <Button
            variant="ghost"
            className="transition-all duration-500 ease-in-out"
            type="submit"
            onClick={() => {
              if (text) {
                const title = editor.getText();

                onSend(text, agents, title);
                editor.commands.clearContent(true);
                setText('');
              }
            }}
          >
            <SendLine size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
