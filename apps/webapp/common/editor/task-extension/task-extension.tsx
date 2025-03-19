import {
  InputRule,
  mergeAttributes,
  Node,
  type KeyboardShortcutCommand,
} from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';
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
    selectable: true, // Allows the whole node to be selectable
    isolating: true, // Ensures that selecting part of the text doesn't include the node itself

    content() {
      return this.options.nested ? 'paragraph block*' : 'paragraph';
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

        let depth = selection.$from.depth;

        while (depth > 0) {
          const node = selection.$from.node(depth);
          if (node.type.name === INLINE_TASK_CONTENT_NAME) {
            return true;
          }
          depth--;
        }

        // Check the root node too
        if (selection.$from.node(0).type.name === INLINE_TASK_CONTENT_NAME) {
          return true;
        }

        return false;
      };

      const shortcuts: Record<string, KeyboardShortcutCommand> = {
        Enter: () => {
          if (!isTaskContent()) {
            return false;
          }

          const { selection } = this.editor.state;
          const { empty, $from } = selection;

          // Only handle empty selections (cursor positions)
          if (!empty) {
            return this.editor.commands.splitListItem(this.name);
          }

          // If cursor is at the start of the task item
          if ($from.parentOffset === 0) {
            return this.editor
              .chain()
              .liftListItem('taskItem')
              .setNode('paragraph', {})
              .run();
          }

          // If cursor is in the middle or at the end
          return this.editor
            .chain()
            .insertContentAt($from.after(), {
              type: this.name,
              attrs: {
                id: undefined,
              },
              content: [{ type: 'paragraph' }],
            })
            .setTextSelection($from.after() + 2) // Move cursor to the new task
            .run();
        },
        'Shift-Tab': () => this.editor.commands.liftListItem(this.name),
        Backspace: () => {
          const state = this.editor.state;
          const selection = state.selection;
          const blockRange = selection.$from.blockRange();
          if (!blockRange) {
            return false;
          }

          if (blockRange.start + 1 !== selection.from) {
            return false;
          }

          const beforeSelection = TextSelection.findFrom(
            state.doc.resolve(blockRange.start - 1),
            -1,
            true,
          );

          const beforeBlockRange = beforeSelection?.$from.blockRange();
          if (beforeBlockRange?.parent.type.name !== this.name) {
            return false;
          }
          return this.editor.commands.deleteRange({
            from: beforeSelection!.from,
            to: selection.from,
          });
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

            chain()
              .wrapIn('taskList')
              .setNode('taskItem', {
                id: undefined,
              })
              .run();
          },
        }),
      ];
    },
  });
