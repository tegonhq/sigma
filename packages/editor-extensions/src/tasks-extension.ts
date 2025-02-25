import { mergeAttributes, Node } from '@tiptap/core';

export const tasksExtension = Node.create({
  name: 'tasksExtension',
  group: 'block',
  content: '(paragraph | bulletList | listItem | task)+',
  selectable: false,

  parseHTML() {
    return [
      {
        tag: 'tasks-extension',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['tasks-extension', mergeAttributes(HTMLAttributes)];
  },
});
