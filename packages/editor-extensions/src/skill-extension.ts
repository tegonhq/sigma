import { mergeAttributes, Node } from '@tiptap/core';

export const skillExtension = Node.create({
  name: 'skill',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      id: {
        default: undefined,
      },
      name: {
        default: undefined,
      },
      agent: {
        default: undefined,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'skill',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['skill', mergeAttributes(HTMLAttributes)];
  },
});
