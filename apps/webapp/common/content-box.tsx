import { cn } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';

interface ContentBoxProps {
  children: React.ReactNode;
  className?: string;
}

export const ContentBox = observer(
  ({ children, className }: ContentBoxProps) => {
    return (
      <main
        className={cn('p-3 pt-0 flex flex-col h-[100vh] w-full', className)}
      >
        <div className="bg-background-3 h-full rounded-lg overflow-hidden shadow flex flex-col">
          {children}
        </div>
      </main>
    );
  },
);
