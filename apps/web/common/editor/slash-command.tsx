import {
  BulletListLine,
  CheckLine,
  CodingLine,
  HeadingLine,
  IssuesLine,
  LinkLine,
  NumberedListLine,
  TextLine,
} from '@tegonhq/ui';
import { ImageIcon } from 'lucide-react';
import { createSuggestionItems } from 'novel/extensions';
import { Command } from 'novel/extensions';

import { uploadFileFn, uploadFn } from './utils';
import { renderItems } from './utils/render-items';

export const suggestionItems = createSuggestionItems([
  {
    title: 'Text',
    description: 'Just start typing with plain text.',
    searchTerms: ['p', 'paragraph'],
    icon: <TextLine size={20} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode('paragraph', 'paragraph')
        .run();
    },
  },
  {
    title: 'To-do List',
    description: 'Track tasks with a to-do list.',
    searchTerms: ['todo', 'task', 'list', 'check', 'checkbox'],
    icon: <CheckLine size={20} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: 'Heading 1',
    description: 'Big section heading.',
    searchTerms: ['title', 'big', 'large'],
    icon: <HeadingLine size={20} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 1 })
        .run();
    },
  },
  {
    title: 'Heading 2',
    description: 'Medium section heading.',
    searchTerms: ['subtitle', 'medium'],
    icon: <HeadingLine size={20} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 2 })
        .run();
    },
  },
  {
    title: 'Heading 3',
    description: 'Small section heading.',
    searchTerms: ['subtitle', 'small'],
    icon: <HeadingLine size={20} />,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode('heading', { level: 3 })
        .run();
    },
  },
  {
    title: 'Bullet List',
    description: 'Create a simple bullet list.',
    searchTerms: ['unordered', 'point'],
    icon: <BulletListLine size={20} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: 'Numbered List',
    description: 'Create a list with numbering.',
    searchTerms: ['ordered'],
    icon: <NumberedListLine size={20} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: 'Code',
    description: 'Capture a code snippet.',
    searchTerms: ['codeblock'],
    icon: <CodingLine size={20} />,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: 'Image',
    description: 'Upload an image from your computer.',
    searchTerms: ['photo', 'picture', 'media'],
    icon: <ImageIcon size={20} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      // upload image
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
        if (input.files?.length) {
          const file = input.files[0];
          const pos = editor.view.state.selection.from;
          uploadFn(file, editor, pos);
        }
      };
      input.click();
    },
  },
  {
    title: 'File upload',
    description: 'Upload an file from your computer.',
    searchTerms: ['photo', 'picture', 'media'],
    icon: <LinkLine size={20} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      // upload image
      const input = document.createElement('input');
      input.type = 'file';

      input.onchange = async () => {
        if (input.files?.length) {
          const file = input.files[0];
          const pos = editor.view.state.selection.from;
          uploadFileFn(file, editor, pos);
        }
      };
      input.click();
    },
  },
  {
    title: 'Task',
    description: 'Search or create task',
    searchTerms: ['task'],
    icon: <IssuesLine size={20} />,
    command: ({ editor, range }) => {
      editor.commands.command(({ tr, state }) => {
        const node = state.schema.nodes['taskExtension'].create({
          type: 'inline',
        });

        tr.replaceWith(range.from, range.to, node);

        return true;
      });
    },
  },
]);

export const slashCommand = Command.configure({
  parent: 'tiptap',
  suggestion: {
    items: () => suggestionItems,
    render: renderItems,
  },
});
