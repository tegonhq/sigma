import { Editor } from '@tiptap/core';
import { ReactRenderer } from '@tiptap/react';
import tippy, { type Instance as TippyInstance } from 'tippy.js';

import { useContextStore } from 'store/global-context-provider';

import { MentionList } from './mention-list';

interface SuggestionProps {
  editor: Editor;
  range: { from: number; to: number };
  query: string;
  items: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clientRect?: any;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useContextSuggestions = (): any => {
  const { pagesStore } = useContextStore();

  return {
    items: async ({ query }: { query: string }) => {
      return pagesStore.searchPages(query, true).slice(0, 5);
    },
    render: () => {
      let reactRenderer: ReactRenderer | null = null;
      let popup: TippyInstance[] | null = null;

      return {
        onStart: (props: SuggestionProps) => {
          if (!props.clientRect) {
            return;
          }

          reactRenderer = new ReactRenderer(MentionList, {
            props,
            editor: props.editor,
          });

          popup = tippy('body', {
            getReferenceClientRect: props.clientRect,
            appendTo: () => document.body,
            content: reactRenderer.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
          });
        },

        onUpdate: (props: SuggestionProps) => {
          if (reactRenderer) {
            reactRenderer.updateProps(props);
          }

          if (props.clientRect && popup) {
            popup[0].setProps({
              getReferenceClientRect: props.clientRect,
            });
          }
        },

        onKeyDown: (props: {
          event: KeyboardEvent;
          range: { from: number; to: number };
          query: string;
        }) => {
          if (props.event.key === 'Escape') {
            popup?.[0]?.hide();
            return true;
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (reactRenderer?.ref as any).onKeyDown(props) ?? false;
        },

        onExit: () => {
          popup?.[0]?.destroy();
          popup = null;
          reactRenderer?.destroy();
          reactRenderer = null;
        },
      };
    },
  };
};
