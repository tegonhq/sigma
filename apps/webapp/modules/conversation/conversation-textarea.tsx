import { Button, cn } from '@redplanethq/ui';
import { Document } from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Plus } from 'lucide-react';
import { EditorContent, CodeBlockLowlight, Placeholder } from 'novel';
import { useCallback, useState, useRef } from 'react';
import React from 'react';

import { EditorRoot, lowlight, type EditorT } from 'common/editor';

import { CustomMention, useContextSuggestions } from './suggestion-extension';

interface Resource {
  type: 'image' | 'pdf';
  name: string;
  data: string; // base64 encoded
  size: number;
}

interface ConversationTextareaProps {
  onSend: (
    value: string,
    agents: string[],
    title: string,
    resources?: Resource[],
  ) => void;
  defaultValue?: string;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
  onChange?: (text: string) => void;
  disabled?: boolean;
  onStop?: () => void;
}

export function ConversationTextarea({
  onSend,
  defaultValue,
  isLoading = false,
  placeholder,
  className,
  onChange,
  onStop,
}: ConversationTextareaProps) {
  const [text, setText] = useState(defaultValue ?? '');
  const [editor, setEditor] = React.useState<EditorT>();
  const [agents, setAgents] = React.useState<string[]>([]);
  const [resources, setResources] = React.useState<Resource[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) {
      return;
    }

    Array.from(files).forEach((file) => {
      // Check file type
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';

      if (!isImage && !isPdf) {
        return; // Skip unsupported files
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        const resource: Resource = {
          type: isImage ? 'image' : 'pdf',
          name: file.name,
          data: base64,
          size: file.size,
        };
        setResources((prev) => [...prev, resource]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeResource = (index: number) => {
    setResources((prev) => prev.filter((_, i) => i !== index));
  };

  // Memoized send handler
  const handleSend = useCallback(() => {
    if (!editor || !text) {
      return;
    }
    const title = editor.getText();
    onSend(text, agents, title, resources);
    editor.commands.clearContent(true);
    setText('');
    setResources([]);
  }, [editor, text, agents, resources, onSend]);

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

      {/* File attachments display */}
      {resources.length > 0 && (
        <div className="p-2 pt-0">
          <div className="flex flex-wrap gap-2">
            {resources.map((resource, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-muted px-3 py-1 rounded-md text-sm"
              >
                <span className="truncate max-w-[150px]">{resource.name}</span>
                <button
                  onClick={() => removeResource(index)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={cn('flex justify-between p-2 pt-0 pb-2 items-center')}>
        <Button
          variant="link"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="gap-1 text-muted-foreground hover:text-foreground px-0 text-sm"
        >
          <Plus className="h-4 w-4" /> Add files
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
        </Button>

        <Button
          variant={isLoading ? 'secondary' : 'default'}
          className="transition-all duration-500 ease-in-out gap-1"
          type="submit"
          size="lg"
          onClick={() => {
            if (isLoading) {
              onStop && onStop();
            }

            if (text) {
              handleSend();
            }
          }}
        >
          {isLoading ? <>Stop</> : <>Chat</>}
        </Button>
      </div>
    </div>
  );
}
