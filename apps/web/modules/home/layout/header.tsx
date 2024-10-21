import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@sigma/ui/components/breadcrumb';
import { Button } from '@sigma/ui/components/ui/button';
import { ArrowLeft, ArrowRight } from '@sigma/ui/icons';
import { observer } from 'mobx-react-lite';

import { SidebarExpand } from './sidebar-expand';
import { useParams, usePathname } from 'next/navigation';
import { useContextStore } from 'store/global-context-provider';

export const Header = observer(() => {
  const { pagesStore } = useContextStore();
  const { pageId } = useParams();

  const getTitle = () => {
    if (pageId) {
      const page = pagesStore.getPageWithId(pageId);

      return page.title ?? 'Untitled';
    }

    return 'Title';
  };

  return (
    <header className="flex px-6 w-full items-center gap-2">
      <div className="flex gap-2 py-4 items-center">
        <SidebarExpand />

        <div className="flex">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} />
          </Button>
          <Button variant="ghost" size="sm">
            <ArrowRight size={16} />
          </Button>
        </div>
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink>{getTitle()}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </div>
    </header>
  );
});
