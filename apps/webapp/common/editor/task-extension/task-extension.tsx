import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import { TaskComponent } from "./task-component";

export const taskExtension = Node.create({
  priority: 51,
  name: "taskExtension",
  group: "inline",
  inline: true,

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
        tag: "task-extension",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["task-extension", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TaskComponent, {});
  },
});
