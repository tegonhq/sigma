import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';

import { Navigation } from 'layouts/app-layout';

import { useApplication } from 'hooks/application';

import { TabViewType } from 'store/application';
import { useContextStore } from 'store/global-context-provider';
import type { ListType } from 'common/types';

interface ListPageHeaderProps {
  list: ListType;
}

export const ListPageHeader = observer(({ list }: ListPageHeaderProps) => {
  const { pagesStore } = useContextStore();
  const page = pagesStore.getPageWithId(list?.pageId);

  return (
    <header className="flex h-[38px] shrink-0 items-center justify-between gap-2 border-border border-b">
      <div className="flex items-center gap-2 px-2">
        <Navigation />
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
});
