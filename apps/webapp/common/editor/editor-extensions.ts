import { Extension, mergeAttributes } from '@tiptap/core';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Heading from '@tiptap/extension-heading';
import { cx } from 'class-variance-authority';
import { all, createLowlight } from 'lowlight';
import {
  TiptapLink,
  HorizontalRule,
  StarterKit,
  Placeholder,
  HighlightExtension,
  AIHighlight,
  TaskList,
  CustomKeymap,
} from 'novel/extensions';
import AutoJoiner from 'tiptap-extension-auto-joiner'; // optional
// import GlobalDragHandle from 'tiptap-extension-global-drag-handle';

import { datePageExtension } from './date-page-extension';
import { GlobalDragHandle } from './drag-handler';
import { fileExtension } from './file-extension';
import { imageExtension } from './image-extension';
import { LinkTaskExtension } from './link-task';
import trailingNode from './trailing-node';

// create a lowlight instance with all languages loaded
const lowlight = createLowlight(all);

const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class: cx('text-primary cursor-pointer'),
  },
});

const horizontalRule = HorizontalRule.configure({
  HTMLAttributes: {
    class: cx('my-2 border-t border-muted-foreground'),
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
        class: `h${node.attrs.level}-style ${levelMap[level]} pt-[1rem]`,
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
      class: cx('list-disc list-outside pl-4 leading-1 my-1 mb-1.5'),
    },
  },
  orderedList: {
    HTMLAttributes: {
      class: cx('list-decimal list-outside pl-4 leading-1 my-1'),
    },
  },
  listItem: {},
  blockquote: {
    HTMLAttributes: {
      class: cx('border-l-4 border-gray-400 dark:border-gray-500'),
    },
  },
  paragraph: {
    HTMLAttributes: {
      class: cx('leading-[24px]'),
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
  horizontalRule,
  heading,
  AIHighlight,
  fileExtension,
  imageExtension,
  HighlightExtension,
  GlobalDragHandle.configure({
    customNodes: ['taskItem'],
  }),
  AutoJoiner,
  TaskList,
  datePageExtension,
  LinkTaskExtension,
  CustomKeymap,
  trailingNode,
  CodeBlockLowlight.configure({
    lowlight,
  }),
];
