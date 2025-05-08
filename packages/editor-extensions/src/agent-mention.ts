import Mention from '@tiptap/extension-mention';
import { mergeAttributes } from '@tiptap/react';

export const AgentMention = Mention.extend({
  parseHTML() {
    return [
      {
        tag: 'agent',
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'agent',
      mergeAttributes(HTMLAttributes),
      HTMLAttributes['data-id'],
    ];
  },
});
