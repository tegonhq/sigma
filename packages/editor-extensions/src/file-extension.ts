import { mergeAttributes, Node } from '@tiptap/core';

export const fileExtension = Node.create({
  name: 'fileExtension',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: {
        default: undefined,
      },
      alt: {
        default: undefined,
      },
      size: {
        default: 0,
      },
      type: {
        default: undefined,
      },
      url: {
        default: 0,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'file-extension',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['file-extension', mergeAttributes(HTMLAttributes)];
  },
});
