import {
  InputRule,
  mergeAttributes,
  Node,
  type KeyboardShortcutCommand,
} from '@tiptap/core';
import {
  ReactNodeViewRenderer,
  type ReactNodeViewRendererOptions,
} from '@tiptap/react';

import { TaskComponent } from './task-component';
export const INLINE_TASK_CONTENT_NAME = 'taskItem';

export const inputRegex = /^\s*(\[([( |x])?\])\s$/;

export const TaskExtension = ({
  update,
}: {
  update: ReactNodeViewRendererOptions['update'];
}) =>
  Node.create({
    name: INLINE_TASK_CONTENT_NAME,

    content() {
      return this.options.nested ? 'paragraph block*' : 'paragraph+';
    },

    defining: true,

    addOptions() {
      return {
        nested: false,
        HTMLAttributes: {},
        taskListTypeName: 'taskList',
      };
    },

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
          tag: INLINE_TASK_CONTENT_NAME,
        },
      ];
    },

    renderHTML({ HTMLAttributes }) {
      return [INLINE_TASK_CONTENT_NAME, mergeAttributes(HTMLAttributes), 0];
    },

    addNodeView() {
      return ReactNodeViewRenderer(TaskComponent, {
        as: 'li',
        attrs: {
          'data-type': 'taskItem',
        } as Record<string, string>,
        update: (props) => {
          update(props);

          props.updateProps();
        },
      } as ReactNodeViewRendererOptions);
    },

    addKeyboardShortcuts() {
      const isTaskContent = () => {
        const selection = this.editor.state.selection;
        return selection.$from.parent.type.name === INLINE_TASK_CONTENT_NAME;
      };

      const shortcuts: Record<string, KeyboardShortcutCommand> = {
        Enter: () => {
          const state = this.editor.state;
          const selection = state.selection;

          if (!isTaskContent()) {
            return false;
          }

          if (selection.$from.parentOffset === 0) {
            return this.editor.commands.setNode('paragraph');
          }

          // if it's not the top level node, let list handle it
          if (
            selection.$from.depth > 3 ||
            selection.$from.parent.nodeSize > 2
          ) {
            this.editor.commands.splitListItem(this.name, {
              id: undefined,
            });

            return true;
          }

          return this.editor.commands.setNode('paragraph');
        },
        'Shift-Tab': () => this.editor.commands.liftListItem(this.name),
        Backspace: () => {
          const state = this.editor.state;
          const selection = state.selection;

          if (!isTaskContent()) {
            return false;
          }

          const blockRange = selection.$from.blockRange();
          if (!blockRange) {
            return false;
          }

          if (blockRange.start + 1 === selection.from && selection.empty) {
            return this.editor
              .chain()
              .liftListItem('listItem')
              .setNode('paragraph', {})
              .run();
          }

          return false;
        },
        'Mod-Backspace': () => {
          return this.editor
            .chain()
            .liftListItem('taskItem')
            .setNode('paragraph', {})
            .run();
        },
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
        new InputRule({
          find: inputRegex,
          handler: ({ state, range, chain }) => {
            const tr = state.tr.delete(range.from, range.to);
            const $start = tr.doc.resolve(range.from);
            const blockRange = $start.blockRange();
            // eslint-disable-next-line curly
            if (!blockRange) return null;

            const taskItem = state.schema.nodes.taskItem;

            chain()
              .wrapIn('taskList')
              .setNode(taskItem, {
                id: undefined,
              })
              .run();
          },
        }),
      ];
    },
  });
