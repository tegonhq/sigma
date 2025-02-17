import {
  mergeAttributes,
  Node,
  wrappingInputRule,
  type KeyboardShortcutCommand,
} from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import { TaskItemComponent } from './task-item-component';

/**
 * Matches a task item to a - [ ] on input.
 */
export const inputRegex = /^\s*(\[([( |x])?\])\s$/;

export const taskItemExtension = Node.create({
  name: 'taskItem',

  addOptions() {
    return {
      nested: true,
      HTMLAttributes: {},
      taskListTypeName: 'taskList',
    };
  },

  defining: true,
  content() {
    return this.options.nested ? 'paragraph block*' : 'paragraph+';
  },

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
        tag: 'task-item',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['li', ['task-item', mergeAttributes(HTMLAttributes)]];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TaskItemComponent, { as: 'li' });
  },

  addKeyboardShortcuts() {
    const shortcuts: Record<string, KeyboardShortcutCommand> = {
      Enter: () => this.editor.commands.splitListItem(this.name),
      'Shift-Tab': () => this.editor.commands.liftListItem(this.name),
    };

    if (!this.options.nested) {
      return shortcuts;
    }

    return {
      ...shortcuts,
      Tab: () => this.editor.commands.sinkListItem(this.name),
    };
  },

  addInputRules() {
    return [
      wrappingInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: (match) => ({
          checked: match[match.length - 1] === 'x',
        }),
      }),
    ];
  },
});
