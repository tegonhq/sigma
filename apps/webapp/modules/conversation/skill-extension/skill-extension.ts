import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { SkillComponent } from './skill-component';

export const skillExtension = Node.create({
  name: 'skill',
  group: 'block',
  atom: true,
  selectable: false,

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
        getAttrs: (element) => {
          return {
            id: element.getAttribute('id'),
            name: element.getAttribute('name'),
            agent: element.getAttribute('agent'),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['skill', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SkillComponent);
  },
});
