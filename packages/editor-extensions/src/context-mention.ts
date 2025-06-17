import Mention from '@tiptap/extension-mention';
import { mergeAttributes } from '@tiptap/react';

export const ContextMention = Mention.extend({
  parseHTML() {
    return [
      {
        tag: 'mention',
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'mention',
      mergeAttributes(HTMLAttributes),
      HTMLAttributes['data-id'],
      HTMLAttributes['data-type'],
    ];
  },
});
