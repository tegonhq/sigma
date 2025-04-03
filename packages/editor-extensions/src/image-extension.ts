import { mergeAttributes, Node } from '@tiptap/core';

export const imageExtension = Node.create({
  name: 'img',
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
      uploading: {
        default: false,
      },
      openViewer: {
        default: false,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'image-extension',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['image-extension', mergeAttributes(HTMLAttributes)];
  },
});
