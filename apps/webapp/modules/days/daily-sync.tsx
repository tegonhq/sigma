import { Button, Checkbox, cn, Dialog, DialogContent } from '@tegonhq/ui';
import { mergeAttributes, Node } from '@tiptap/core';
import {
  EditorContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  useEditor,
} from '@tiptap/react';
import { RefreshCcw } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { plainExtensions } from 'common/editor';

import { useApplication } from 'hooks/application';

import { useGetDailySync } from 'services/users';

import { TabViewType } from 'store/application';
import { useContextStore } from 'store/global-context-provider';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TaskComponent = observer((props: any) => {
  const taskId = props.node.attrs.id;
  const { tasksStore, pagesStore } = useContextStore();
  const task = tasksStore.getTaskWithId(taskId);
  const page = pagesStore.getPageWithId(task?.pageId);
  const { updateTabType } = useApplication();

  const openTask = () => {
    updateTabType(0, TabViewType.MY_TASKS, { entityId: taskId });
  };

  return (
    <NodeViewWrapper className="task-item-component" as="span">
      <button
        className={cn(
          'inline-flex max-w-[200px] h-5 items-center text-left mr-1 bg-grayAlpha-100 hover:bg-grayAlpha-200 p-1 text-sm rounded-sm relative top-[2px]',
        )}
        onClick={() => openTask()}
      >
        <Checkbox className="shrink-0 h-[14px] w-[14px] ml-1 mr-1 rounded-[6px]" />
        <span className="text-muted-foreground font-mono shrink-0 mr-1">
          T-{task?.number}
        </span>

        <div className="inline-flex items-center justify-start shrink min-w-[0px] min-h-[24px]">
          <div className={cn('text-left truncate text-sm')}>{page?.title}</div>
        </div>
      </button>
    </NodeViewWrapper>
  );
});

export const TaskExtension = Node.create({
  name: 'taskItem',
  group: 'inline',
  inline: true,
  atom: true,

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
        tag: 'taskItem',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['taskItem', mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TaskComponent, {
      as: 'span',
    });
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DailySyncEditor = ({ sync }: { sync: any }) => {
  const editor = useEditor({
    extensions: [...plainExtensions, TaskExtension],
    editable: false,
    content: sync.content,
  });

  return (
    <>
      <h3 className="text-lg font-medium">{sync.title}</h3>

      <EditorContent editor={editor} />
    </>
  );
};

export const DailySync = ({ date }: { date: string }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { data: dailySync } = useGetDailySync(date);

  if (!dailySync) {
    return null;
  }

  return (
    <>
      <Button
        variant="secondary"
        className="text-base gap-1 ml-1"
        onClick={() => setIsOpen(true)}
      >
        <RefreshCcw size={16} />
        Daily sync
      </Button>

      {isOpen && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent
            closeIcon={false}
            className="sm:max-w-[600px] min-w-[600px] gap-2 p-4 overflow-y-auto max-h-54"
          >
            <DailySyncEditor sync={dailySync} />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
