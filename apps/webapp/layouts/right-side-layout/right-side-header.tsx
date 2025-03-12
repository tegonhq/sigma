import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  Button,
  Close,
} from '@tegonhq/ui';
import { MoveDiagonal } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import React from 'react';

import { useContextStore } from 'store/global-context-provider';

interface RightSideHeaderProps {
  taskId: string;
  onClose: () => void;
}

export const RightSideHeader = observer(
  ({ taskId, onClose }: RightSideHeaderProps) => {
    const { tasksStore, pagesStore } = useContextStore();

    const task = tasksStore.getTaskWithId(taskId);
    const page = pagesStore.getPageWithId(task?.pageId);

    return (
      <header className="flex h-[38px] shrink-0 items-center justify-between gap-2 border-border border-b">
        <div className="flex items-center gap-2 px-2">
          <div className="flex gap-1 items-center">
            <Button size="sm" variant="ghost" onClick={onClose}>
              <Close size={14} />
            </Button>

            {taskId && (
              <Button size="sm" variant="ghost">
                <MoveDiagonal size={14} />
              </Button>
            )}
          </div>
          <Breadcrumb>
            <BreadcrumbList className="gap-1">
              {page && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="max-w-[500px] truncate">
                      {page.title}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
    );
  },
);
