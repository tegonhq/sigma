import { mergeAttributes, Node } from '@tiptap/core';

import { TasksComponent } from './tasks-component';
import { ReactNodeViewRenderer } from '../ReactNodeView';

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

  addNodeView() {
    return ReactNodeViewRenderer(TasksComponent);
  },
});
