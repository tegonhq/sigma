import { InputRule, mergeAttributes } from '@tiptap/core';
import { Paragraph } from '@tiptap/extension-paragraph';
import {
  ReactNodeViewRenderer,
  type ReactNodeViewRendererOptions,
} from '@tiptap/react';

import { TaskComponent } from './task-component';
export const INLINE_TASK_CONTENT_NAME = 'task';

export const inputRegex = /^\s*(\[([( |x])?\])\s$/;

export const TaskExtension = ({
  update,
}: {
  update: ReactNodeViewRendererOptions['update'];
}) =>
  Paragraph.extend({
    name: INLINE_TASK_CONTENT_NAME,
    selectable: true,

    addOptions() {
      return {
        HTMLAttributes: {},
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
        update: (props) => {
          update(props);

          props.updateProps();
        },
      } as ReactNodeViewRendererOptions);
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addKeyboardShortcuts(this: any) {
      const isTaskContent = () => {
        const selection = this.editor.state.selection;
        return selection.$from.parent.type.name === INLINE_TASK_CONTENT_NAME;
      };

      return {
        Enter: () => {
          if (!isTaskContent()) {
            return false;
          }

          const state = this.editor.state;
          const selection = state.selection;

          let insideTasksExtension = false;

          // Traverse up the hierarchy to check if any parent node is `tasksExtension`
          for (let depth = selection.$from.depth; depth > 0; depth--) {
            const parentNode = selection.$from.node(depth);
            if (parentNode.type.name === 'tasksExtension') {
              insideTasksExtension = true;
            }
          }
          if (selection.$from.parentOffset === 0) {
            return this.editor
              .chain()
              .liftListItem('listItem')
              .setNode('paragraph', {})
              .run();
          }

          if (insideTasksExtension) {
            const task = this.editor.schema.nodes.task;

            this.editor
              .chain()
              .splitListItem('listItem')
              .setNode(task, {
                id: undefined,
              })
              .run();

            return true;
          }

          // if it's not the top level node, let list handle it
          if (
            selection.$from.depth > 3 ||
            selection.$from.parent.nodeSize > 2
          ) {
            const task = this.editor.schema.nodes.task;
            this.editor
              .chain()
              .splitListItem('listItem')
              .setNode(task, {
                id: undefined,
              })
              .run();
            return true;
          }

          return this.editor
            .chain()
            .liftListItem('listItem')
            .setNode('paragraph', {})
            .run();
        },
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
            .liftListItem('listItem')
            .setNode('paragraph', {})
            .run();
        },

        'Shift-Tab': () => {
          if (!isTaskContent()) {
            return false;
          }

          const state = this.editor.state;
          const selection = state.selection;
          let insideTasksExtension = false;

          // Traverse up the hierarchy to check if any parent node is `tasksExtension`
          for (let depth = selection.$from.depth; depth > 0; depth--) {
            const parentNode = selection.$from.node(depth);
            if (parentNode.type.name === 'tasksExtension') {
              insideTasksExtension = true;
            }
          }

          if (insideTasksExtension) {
            return true;
          }

          if (this.editor.state.selection.$head.depth < 4) {
            return this.editor
              .chain()
              .liftListItem('listItem')
              .setNode('paragraph', {})
              .run();
          }
          return false;
        },
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

            const task = state.schema.nodes.task;

            chain()
              .wrapIn('taskList')
              .wrapIn('listItem')
              .setNode(task, {
                id: undefined,
              })
              .run();
          },
        }),
      ];
    },
  });
