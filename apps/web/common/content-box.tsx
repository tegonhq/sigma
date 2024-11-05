import { observer } from 'mobx-react-lite';

interface ContentBoxProps {
  children: React.ReactNode;
  className?: string;
}

export const ContentBox = observer(({ children }: ContentBoxProps) => {
  return (
    <main className="p-3 pl-0 flex flex-col h-[calc(100vh_-_40px)] w-full">
      <div className="bg-background-2 h-full rounded-lg overflow-hidden shadow flex flex-col">
        {children}
      </div>
    </main>
  );
});
