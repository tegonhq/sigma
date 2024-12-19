import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { DatePageComponent } from './date-page-component';

export const datePageExtension = Node.create({
  priority: 51,
  name: 'datePageExtension',
  group: 'inline',
  inline: true,

  addAttributes() {
    return {
      pageId: {
        default: undefined,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'date-page-extension',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['date-page-extension', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DatePageComponent, {});
  },
});
