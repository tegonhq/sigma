import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@tegonhq/ui';
import { format } from 'date-fns';
import { useApplication } from 'hooks/application';
import { observer } from 'mobx-react-lite';

interface HeaderProps {
  actions?: React.ReactNode;
}

export const Header = observer(({ actions }: HeaderProps) => {
  const { tabs } = useApplication();
  const firstTab = tabs[0];
  const date = firstTab.data.date;

  return (
    <header className="flex h-10 shrink-0 items-center justify-between gap-2 border-border border-b font-sans">
      <div className="flex items-center gap-2 px-6">
        <Breadcrumb>
          <BreadcrumbList className="gap-1">
            <BreadcrumbItem>
              <BreadcrumbPage>My day</BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {format(new Date(date), 'EEEE, MMMM do, yyyy')}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {actions}
    </header>
  );
});
