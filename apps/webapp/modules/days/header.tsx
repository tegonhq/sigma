import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';

import { Navigation } from 'layouts/app-layout';

interface HeaderProps {
  actions?: React.ReactNode;
}

export const Header = observer(({ actions }: HeaderProps) => {
  return (
    <header className="flex h-[38px] shrink-0 items-center justify-between gap-2 border-border border-b font-sans">
      <div className="flex items-center gap-2 px-2">
        <Navigation />
        <Breadcrumb>
          <BreadcrumbList className="gap-1">
            <BreadcrumbItem>
              <BreadcrumbPage className="text-base">Days</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {actions}
    </header>
  );
});
