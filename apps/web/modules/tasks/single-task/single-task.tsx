import {
  ScrollArea,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Separator,
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { SCOPES } from 'common/shortcut-scopes';

import { useApplication } from 'hooks/application';

import { useUpdatePageMutation } from 'services/pages';

import { TabViewType } from 'store/application';
import { useContextStore } from 'store/global-context-provider';

import { SingleTaskEditor } from './single-task-editor';
import { SingleTaskMetadata } from './single-task-metadata';
import { PageTitle } from './single-task-title';
import { SingleTaskIntegration } from './single-task-integration';

interface SingleTaskProps {
  index: number;
}

export const SingleTask = observer(({ index }: SingleTaskProps) => {
  const { tasksStore, pagesStore } = useContextStore();
  const { tabs } = useApplication();
  const task = tasksStore.getTaskWithId(tabs[index].entity_id);
  const page = pagesStore.getPageWithId(task?.pageId);

  const { mutate: updatePage } = useUpdatePageMutation({});

  const onBack = () => {
    tabs[index].changeType(TabViewType.MY_TASKS, undefined);
  };

  useHotkeys(
    [Key.Escape],
    () => {
      onBack();
    },
    {
      scopes: [SCOPES.Task],
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
  );

  const onChange = (title: string) => {
    updatePage({
      pageId: page.id,
      title,
    });
  };

  if (!task || !page) {
    return null;
  }

  if (task.integrationAccountId) {
    return <SingleTaskIntegration task={task} page={page} onBack={onBack} />;
  }

  return (
    <ScrollArea className="w-full h-full p-4">
      <Breadcrumb className="pb-3">
        <BreadcrumbItem>
          <BreadcrumbLink onClick={onBack} className="flex items-center gap-2">
            <span className="inline-block">Tasks</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink>
            <div className="inline-flex items-center gap-1 min-w-[0px]">
              <div className="truncate"> {page.title}</div>
            </div>
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <div className="flex flex-col gap-2">
        <div>
          <PageTitle value={page.title} onChange={onChange} />
        </div>

        <SingleTaskMetadata task={task} />
        <Separator />

        <SingleTaskEditor page={page} autoFocus />
      </div>
    </ScrollArea>
  );
});
