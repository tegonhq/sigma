import { mergeAttributes, Node } from '@tiptap/core';

import { TasksComponent } from './tasks-component';
import { ReactNodeViewRenderer } from '../ReactNodeView';

export const tasksExtension = Node.create({
  name: 'tasksExtension',
  group: 'block',
  content: '(paragraph | taskList | listItem | task)*',
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addKeyboardShortcuts(this: any) {
    return {
      Backspace: () => {
        const state = this.editor.state;
        const selection = state.selection;

        if (selection.$from.pos < 3) {
          return true;
        }

        let tasksExtensionIsEmpty = false;

        // Traverse up the hierarchy to check if any parent node is `tasksExtension`
        for (let depth = selection.$from.depth; depth > 0; depth--) {
          const parentNode = selection.$from.node(depth);
          if (parentNode.type.name === 'tasksExtension') {
            tasksExtensionIsEmpty =
              parentNode.textContent === '' ? true : false;
          }
        }

        if (tasksExtensionIsEmpty && selection.$from.pos < 3) {
          return true;
        }
      },
      'Mod-Backspace': () => {
        const state = this.editor.state;
        const selection = state.selection;

        if (selection.$from.pos < 3) {
          return true;
        }

        let tasksExtensionIsEmpty = false;

        // Traverse up the hierarchy to check if any parent node is `tasksExtension`
        for (let depth = selection.$from.depth; depth > 0; depth--) {
          const parentNode = selection.$from.node(depth);
          if (parentNode.type.name === 'tasksExtension') {
            tasksExtensionIsEmpty =
              parentNode.textContent === '' ? true : false;
          }
        }

        if (tasksExtensionIsEmpty && selection.$from.pos < 3) {
          return true;
        }
      },
      Enter: () => {
        const state = this.editor.state;
        const selection = state.selection;

        let tasksExtensionIsEmpty = false;

        // Traverse up the hierarchy to check if any parent node is `tasksExtension`
        for (let depth = selection.$from.depth; depth > 0; depth--) {
          const parentNode = selection.$from.node(depth);
          if (parentNode.type.name === 'tasksExtension') {
            tasksExtensionIsEmpty =
              parentNode.textContent === '' ? true : false;
          }
        }

        if (tasksExtensionIsEmpty) {
          return true;
        }
      },
    };
  },
});
