import { mergeAttributes, Node } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { TasksComponent } from './tasks-component';
import { Text } from '@tiptap/extension-text';

export const tasksExtension = Node.create({
  name: 'tasksExtension',
  group: 'block',
  content: 'block+',

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

  addNodeView() {
    return ReactNodeViewRenderer(TasksComponent);
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        filterTransaction(transaction, state) {
          let result = true; // true for keep, false for stop transaction
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const replaceSteps: any[] = [];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          transaction.steps.forEach((step: any, index) => {
            if (step.jsonID === 'replace') {
              replaceSteps.push(index);
            }
          });

          replaceSteps.forEach((index) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const map: any = transaction.mapping.maps[index];
            const oldStart = map.ranges[0];
            const oldEnd = map.ranges[0] + map.ranges[1];
            state.doc.nodesBetween(oldStart, oldEnd, (node) => {
              // if (node.type.name === 'tasksExtension') {
              //   result = false;
              // }
            });
          });
          return result;
        },
      }),
    ];
  },
});
