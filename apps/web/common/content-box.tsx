import { cn } from '@sigma/ui/lib/utils';
import { observer } from 'mobx-react-lite';

interface ContentBoxProps {
  children: React.ReactNode;
  className?: string;
}

export const ContentBox = observer(
  ({ children, className }: ContentBoxProps) => {
    return (
      <main
        className={cn(
          'p-3 pt-0 flex flex-col h-[calc(100vh_-_40px)] w-full',
          className,
        )}
      >
        <div className="bg-background-2 h-full rounded-lg overflow-hidden shadow flex flex-col">
          {children}
        </div>
      </main>
    );
  },
);
