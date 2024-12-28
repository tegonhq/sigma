import { mergeAttributes, Node } from '@tiptap/core';

export const taskExtension = Node.create({
  priority: 51,
  name: 'taskExtension',
  group: 'inline',
  inline: true,

  addAttributes() {
    return {
      id: {
        default: undefined,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'task-extension',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['task-extension', mergeAttributes(HTMLAttributes)];
  },
});
