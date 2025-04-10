import type { Agent } from './mention-list';

import Mention from '@tiptap/extension-mention';
import { mergeAttributes } from '@tiptap/react';

import { useMentionSuggestions, agents } from './use-agent-suggestions';

export const CustomMention = Mention.extend({
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
  addNodeView() {
    return ({ node }) => {
      const span = document.createElement('span');
      span.textContent = node.attrs.id;
      return { dom: span };
    };
  },
});

export { useMentionSuggestions, agents };
export type { Agent };
