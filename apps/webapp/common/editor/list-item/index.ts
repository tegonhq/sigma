import ListItem from '@tiptap/extension-list-item';
import { TextSelection } from '@tiptap/pm/state';

export default ListItem.extend({
  content:
    '(paragraph (taskList|bulletList|orderedList)*)|(task (taskList|bulletList|orderedList)*)',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addKeyboardShortcuts(this: any) {
    return {
      ...this.parent?.(),
      Tab: () => {
        const state = this.editor.state;
        const selection = state.selection;

        const blockRange = selection.$from.blockRange();
        if (!blockRange) {
          return false;
        }
        if (blockRange.parent.type.name !== this.name) {
          return false;
        }
        const beforeRange = selection.$to.blockRange(
          state.doc.resolve(blockRange.start - 2),
        );
        let chain = this.editor.chain();
        if (
          beforeRange &&
          ['taskList', 'bulletList', 'orderedList'].includes(
            beforeRange.$from.nodeBefore?.type.name as string,
          ) &&
          this.editor.can().joinBackward()
        ) {
          chain = chain.joinBackward();
        }
        return chain.sinkListItem(this.name).run();
      },
      'Shift-Tab': () => {
        return this.editor.commands.liftListItem(this.name);
      },
      Backspace: () => {
        const state = this.editor.state;
        const selection = state.selection;
        const blockRange = selection.$from.blockRange();
        if (!blockRange) {
          return false;
        }
        if (blockRange.parent.type.name !== this.name || !selection.empty) {
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
    };
  },
});
