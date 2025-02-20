import { Editor } from '@tiptap/core';

export const addTasksSectionIfNotFound = (editor: Editor) => {
  let hasTasksSection = false;

  // Check if tasks section exists at the start of the document
  // Check if tasks section exists anywhere in the document
  editor.state.doc.descendants((node) => {
    if (node.type.name === 'task') {
      hasTasksSection = true;
      return false;
    }
  });

  if (!hasTasksSection) {
    console.log(editor);

    editor.commands.insertContentAt(0, {
      type: 'tasksExtension',
    });
  }

  // If tasks section doesn't exist, add it at the start
};
