/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from '@tegonhq/ui';
import { Editor, ReactRenderer } from '@tiptap/react';
import React, { useImperativeHandle } from 'react';
import tippy from 'tippy.js';

import { useContextStore } from 'store/global-context-provider';

export const TasksCommand = React.forwardRef(
  ({ query, editor }: { query: string; editor: Editor }, ref) => {
    const { tasksStore, pagesStore } = useContextStore();
    const tasksWithTitle = tasksStore.getTasks({}).map((task) => {
      return { ...task, title: pagesStore.getPageWithId(task.pageId)?.title };
    });

    const getItems = React.useCallback(() => {
      return tasksWithTitle
        .filter((task) => {
          const searchQuery = query.toLowerCase();
          const taskNumber = `T-${task.number}`.toLowerCase();

          return (
            task.title?.toLowerCase().includes(searchQuery) ||
            false ||
            taskNumber.includes(searchQuery)
          );
        })
        .splice(0, 10);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    const onCommandSelect = (index: number) => {
      const task = getItems()[index];
      const { from } = editor.state.selection;

      editor
        .chain()
        .deleteRange({
          from: from - (query.length + 2), // Delete the /t and the query text
          to: from,
        })
        .insertContent([
          {
            type: 'taskList',
            content: [
              {
                type: 'taskItem',
                attrs: { id: task.id },
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      {
                        type: 'text',
                        text: task.title,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ])
        .run();
    };

    const [selectedIndex, setSelectedIndex] = React.useState(0);

    const upHandler = () => {
      setSelectedIndex(
        (prevIndex) => (prevIndex + getItems().length - 1) % getItems().length,
      );
    };

    const downHandler = () => {
      setSelectedIndex((prevIndex) => (prevIndex + 1) % getItems().length);
    };

    const enterHandler = () => {
      onCommandSelect(selectedIndex);
    };

    React.useEffect(() => {
      setSelectedIndex(0);
    }, []);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        switch (event.key) {
          case 'ArrowUp':
            upHandler();
            return true;
          case 'ArrowDown':
            downHandler();
            return true;
          case 'Enter':
            enterHandler();
            return true;
          default:
            return false;
        }
      },
    }));

    return (
      <div className="bg-popover border border-border rounded shadow flex flex-col gap-0.5 overflow-auto p-1 relative">
        {getItems().length > 0 ? (
          getItems().map((item, index) => (
            <button
              className={cn(
                'flex items-center gap-1 w-full text-left bg-transparent hover:bg-grayAlpha-100 p-1 rounded',
                index === selectedIndex ? 'bg-grayAlpha-100' : '',
              )}
              key={index}
              onClick={() => onCommandSelect(index)}
            >
              <span className="text-muted-foreground font-mono shrink-0 min-w-[50px]">
                T-{item.number}
              </span>
              {item.title}
            </button>
          ))
        ) : (
          <div className="item">No result</div>
        )}
      </div>
    );
  },
);

TasksCommand.displayName = 'TasksCommand';

export const renderItems = () => {
  let component: ReactRenderer | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let popup: any | null = null;

  return {
    // @ts-expect-error Taken from the source
    onStart: (props: any) => {
      component = new ReactRenderer(TasksCommand, {
        props,
        editor: props.editor,
      });

      const { selection } = props.editor.state;

      const parentNode = selection.$from.node(selection.$from.depth);
      const blockType = parentNode.type.name;

      if (blockType === 'codeBlock') {
        return false;
      }

      popup = tippy('body', {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
      });
    },
    onUpdate: (props: any) => {
      component?.updateProps(props);

      popup &&
        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
    },

    onKeyDown: (props: { event: KeyboardEvent }) => {
      if (props.event.key === 'Escape') {
        popup?.[0].hide();

        return true;
      }

      // @ts-expect-error Taken from the source
      return component?.ref?.onKeyDown(props) ?? false;
    },
    onExit: () => {
      popup?.[0].destroy();
      component?.destroy();
    },
  };
};
