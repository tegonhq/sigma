import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@sigma/ui/components/breadcrumb';
import { observer } from 'mobx-react-lite';

import { SidebarExpand } from './sidebar-expand';

interface HeaderProps {
  title: string;
}

export const Header = observer(({ title }: HeaderProps) => {
  return (
    <header className="flex px-6 w-full items-center gap-2">
      <div className="flex gap-2 py-4 items-center">
        <SidebarExpand />

        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink>{title}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </div>
    </header>
  );
});
