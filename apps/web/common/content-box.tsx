import { cn } from '@sigma/ui/lib/utils';
import { observer } from 'mobx-react-lite';

import { useContextStore } from 'store/global-context-provider';

interface ContentBoxProps {
  children: React.ReactNode;
  className?: string;
}

export const ContentBox = observer(({ children }: ContentBoxProps) => {
  const { applicationStore } = useContextStore();

  return (
    <main
      className={cn(
        'p-3 pl-0 flex flex-col h-[calc(100vh_-_40px)] w-full',
        applicationStore.sidebarCollapsed && 'pl-3',
      )}
    >
      <div className="bg-background-2 h-full rounded-lg overflow-hidden shadow flex flex-col">
        {children}
      </div>
    </main>
  );
});
