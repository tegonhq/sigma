import { InputRule, mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { TaskComponent } from './task-component';

export const inputRegex = /^\s*(\[([( |x])?\])\s$/;
/**
 * Matches a task item to a - [ ] on input.
 */
export const taskInputRegex = /^\s*(T-\d+)\s$/;

export const taskExtension = Node.create({
  priority: 51,
  name: 'task',
  group: 'inline',
  inline: true,

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

  addNodeView() {
    return ReactNodeViewRenderer(TaskComponent, {});
  },

  addInputRules() {
    return [
      new InputRule({
        find: inputRegex,
        handler: ({ state, range, chain }) => {
          // const editor = ctx.editor()!;
          const tr = state.tr.delete(range.from, range.to);
          const $start = tr.doc.resolve(range.from);
          const blockRange = $start.blockRange();
          if (!blockRange) {
            return null;
          }

          chain()
            .insertContent([
              {
                type: 'task',
                attrs: {
                  id: undefined,
                },
              },
            ])
            .focus()
            .run();
        },
      }),
    ];
  },
});
