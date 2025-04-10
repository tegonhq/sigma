import { Button, Close, cn, SendLine } from '@tegonhq/ui';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { EditorContent } from 'novel';
import { Placeholder } from 'novel/extensions';
import { useState } from 'react';
import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { EditorRoot, type EditorT } from 'common/editor';
import { getIcon, type IconType } from 'common/icon-utils';
import { SCOPES } from 'common/shortcut-scopes';

import {
  CustomMention,
  useMentionSuggestions,
  type Agent,
  agents as AllAgents,
} from './suggestion-extension';

interface ConversationTextareaProps {
  onSend: (value: string, agents: string[]) => void;
}

export function ConversationTextarea({ onSend }: ConversationTextareaProps) {
  const [text, setText] = useState('');
  const [editor, setEditor] = React.useState<EditorT>();
  const [agents, setAgents] = React.useState([]);

  const onAgentMention = (agent: string) => {
    setAgents([...agents, agent]);
  };

  const suggestion = useMentionSuggestions({ onAgentMention });

  useHotkeys(
    [`${Key.Meta}+${Key.Enter}`],
    () => {
      onSend(text, agents);
      setText('');
      setAgents([]);
      editor.commands.clearContent(true);
    },
    {
      scopes: [SCOPES.AI],
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
  );

  const deleteAgent = (agent: string) => {
    setAgents(agents.filter((a) => a !== agent));
  };

  return (
    <div className="p-2">
      <div className="flex flex-col rounded pt-2 bg-grayAlpha-100">
        <EditorRoot>
          <EditorContent
            extensions={[
              Document,
              Paragraph,
              Text,
              CustomMention.configure({
                suggestion,
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
              setText(editor.getHTML());
            }}
            shouldRerenderOnTransaction={false}
            editorProps={{
              attributes: {
                class: `prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full`,
              },
            }}
            immediatelyRender={false}
            className={cn(
              'editor-container w-full min-w-full text-base sm:rounded-lg px-3',
            )}
          ></EditorContent>
        </EditorRoot>

        <div
          className={cn(
            'flex justify-end p-2 items-center',
            agents.length > 0 && 'justify-between',
          )}
        >
          {agents.length > 0 && (
            <div className="flex gap-1">
              {agents.map((key, index: number) => {
                const Icon = getIcon(key as IconType);
                const agent: Agent = AllAgents.find((ag) => ag.key === key);

                return (
                  <div className="flex" key={index}>
                    <Button
                      className="items-center"
                      size="sm"
                      variant="secondary"
                      onClick={() => deleteAgent(key)}
                    >
                      <Icon size={16} key={index} className="rounded-sm mr-1" />
                      {agent?.name}
                      <Close size={12} className="ml-1 relative top-[1px]" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
          <Button
            variant="ghost"
            className="transition-all duration-500 ease-in-out"
            type="submit"
            onClick={() => {
              onSend(text, agents);
              setAgents([]);
              editor.commands.clearContent(true);
              setText('');
            }}
          >
            <SendLine size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
