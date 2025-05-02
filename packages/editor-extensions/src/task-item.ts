import { mergeAttributes, Node } from '@tiptap/core';

export const INLINE_TASK_CONTENT_NAME = 'taskItem';

export const inputRegex = /^\s*(\[([( |x])?\])\s$/;

export const TaskExtension = Node.create({
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
      uuid: {},
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
});
