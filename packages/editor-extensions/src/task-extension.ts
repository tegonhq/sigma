import { mergeAttributes } from '@tiptap/core';
import { Paragraph } from '@tiptap/extension-paragraph';

/// Copy of webapp/common/editor/task-extension
export const taskExtension = Paragraph.extend({
  name: 'task',
  selectable: true,

  addAttributes() {
    return {
      id: {
        default: undefined,
      },
      number: {
        default: undefined,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'task',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['task', mergeAttributes(HTMLAttributes), 0];
  },
});
