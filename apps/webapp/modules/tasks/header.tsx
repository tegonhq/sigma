import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@redplanethq/ui';
import { observer } from 'mobx-react-lite';

import { useApplication } from 'hooks/application';

import { TabViewType } from 'store/application';
import { useContextStore } from 'store/global-context-provider';

interface HeaderProps {
  actions?: React.ReactNode;
}

export const Header = observer(({ actions }: HeaderProps) => {
  const { activeTab, changeActiveTab } = useApplication();

  const entityId = activeTab.entity_id;
  const { tasksStore, pagesStore } = useContextStore();
  const task = tasksStore.getTaskWithId(entityId);
  const page = pagesStore.getPageWithId(task?.pageId);

  return (
    <header className="flex h-[38px] shrink-0 items-center justify-between gap-2 border-border border-b">
      <div className="flex items-center gap-2 px-4">
        <Breadcrumb>
          <BreadcrumbList className="gap-1">
            <BreadcrumbItem
              onClick={() => changeActiveTab(TabViewType.MY_TASKS, {})}
            >
              <BreadcrumbPage>Tasks</BreadcrumbPage>
            </BreadcrumbItem>
            {page && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="max-w-[300px] truncate">
                    {page.title}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="pr-2">{actions}</div>
    </header>
  );
});
