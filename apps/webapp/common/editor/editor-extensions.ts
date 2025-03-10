import { Extension, mergeAttributes } from '@tiptap/core';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Heading from '@tiptap/extension-heading';
import { cx } from 'class-variance-authority';
import { all, createLowlight } from 'lowlight';
import {
  TiptapLink,
  TaskList,
  TaskItem,
  HorizontalRule,
  StarterKit,
  Placeholder,
  HighlightExtension,
  AIHighlight,
} from 'novel/extensions';

import { datePageExtension } from './date-page-extension';
import { fileExtension } from './file-extension';
import { imageExtension } from './image-extension';
import { taskExtension } from './task-extension';

// create a lowlight instance with all languages loaded
const lowlight = createLowlight(all);

const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class: cx('text-primary cursor-pointer'),
  },
});

const taskList = TaskList.configure({
  HTMLAttributes: {
    class: cx('not-prose'),
  },
});

const taskItem = TaskItem.configure({
  HTMLAttributes: {
    class: cx('flex items-start gap-1 my-1'),
  },
  nested: true,
});

const horizontalRule = HorizontalRule.configure({
  HTMLAttributes: {
    class: cx('mt-4 mb-6 border-t border-muted-foreground'),
  },
});

const heading = Heading.extend({
  renderHTML({ node, HTMLAttributes }) {
    const hasLevel = this.options.levels.includes(node.attrs.level);
    const level: 1 | 2 | 3 = hasLevel
      ? node.attrs.level
      : this.options.levels[0];
    const levelMap = { 1: 'text-2xl', 2: 'text-xl', 3: 'text-lg' };

    return [
      `h${level}`,
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: `h${node.attrs.level}-style ${levelMap[level]} pt-2`,
      }),
      0,
    ];
  },
}).configure({ levels: [1, 2, 3] });

const starterKit = StarterKit.configure({
  heading: false,
  history: false,
  bulletList: {
    HTMLAttributes: {
      class: cx('list-disc list-outside leading-1 pl-4 my-1'),
    },
  },
  orderedList: {
    HTMLAttributes: {
      class: cx('list-decimal list-outside pl-6 leading-1 my-1'),
    },
  },
  listItem: {
    HTMLAttributes: {
      class: cx('leading-normal my-1'),
    },
  },
  blockquote: {
    HTMLAttributes: {
      class: cx('border-l-4 border-gray-400 dark:border-gray-500'),
    },
  },
  codeBlock: false,
  code: {
    HTMLAttributes: {
      class: cx(
        'rounded-md bg-grayAlpha-100 text-[#BF4594] px-1.5 py-1 font-mono font-medium border-none',
      ),
      spellcheck: 'false',
    },
  },
  horizontalRule: false,
  dropcursor: {
    color: '#DBEAFE',
    width: 4,
  },
  gapcursor: false,
});

const defaultPlaceholder = Placeholder.configure({
  placeholder: ({ node }) => {
    if (node.type.name === 'heading') {
      return `Heading ${node.attrs.level}`;
    }
    if (node.type.name === 'image' || node.type.name === 'table') {
      return '';
    }
    if (node.type.name === 'codeBlock') {
      return 'Type in your code here...';
    }

    return '';
  },
  includeChildren: true,
});

export const getPlaceholder = (placeholder: string | Extension) => {
  if (!placeholder) {
    return defaultPlaceholder;
  }

  if (typeof placeholder === 'string') {
    return Placeholder.configure({
      placeholder: () => {
        return placeholder;
      },
      includeChildren: true,
    });
  }

  return placeholder;
};

export const defaultExtensions = [
  starterKit,
  tiptapLink,
  taskList,
  taskItem,
  horizontalRule,
  heading,
  AIHighlight,
  fileExtension,
  imageExtension,
  HighlightExtension,
  taskExtension,
  datePageExtension,
  CodeBlockLowlight.configure({
    lowlight,
  }),
];
