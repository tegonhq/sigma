import { mergeAttributes, Node } from '@tiptap/core';

/// Copy of webapp/common/editor/task-extension
export const taskExtension = Node.create({
  priority: 51,
  name: 'task',
  group: 'inline',

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
    return ['task', mergeAttributes(HTMLAttributes)];
  },
});
