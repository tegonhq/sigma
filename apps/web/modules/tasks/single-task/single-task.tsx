import { ScrollArea } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';

export const SingleTask = observer(() => {
  return (
    <ScrollArea className="w-full h-full p-6" id="status-list">
      <div className="flex justify-between pb-4 items-center">
        <h2 className="text-lg"> Tasks</h2>
      </div>
    </ScrollArea>
  );
});
