import {
  ArrowLeft,
  ArrowRight,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
  SidebarLine,
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';

import { useApplication } from 'hooks/application';

import { TabViewType } from 'store/application';
import { useContextStore } from 'store/global-context-provider';
import { Navigation } from 'layouts/app-layout';

interface HeaderProps {
  actions?: React.ReactNode;
}

export const Header = observer(({ actions }: HeaderProps) => {
  const { tabs, updateTabType } = useApplication();
  const firstTab = tabs[0];
  const entityId = firstTab.entity_id;
  const { tasksStore, pagesStore } = useContextStore();
  const task = tasksStore.getTaskWithId(entityId);
  const page = pagesStore.getPageWithId(task?.pageId);

  return (
    <header className="flex h-[38px] shrink-0 items-center justify-between gap-2 border-border border-b">
      <div className="flex items-center gap-2 px-2">
        <Navigation />
        <Breadcrumb>
          <BreadcrumbList className="gap-1">
            <BreadcrumbItem
              onClick={() => updateTabType(0, TabViewType.MY_TASKS, {})}
            >
              <BreadcrumbPage>Tasks</BreadcrumbPage>
            </BreadcrumbItem>
            {page && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{page.title}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="pr-4">{actions}</div>
    </header>
  );
});
