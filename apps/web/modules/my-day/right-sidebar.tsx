import { Calendar } from '@sigma/ui/components/calendar';
import { observer } from 'mobx-react-lite';

import { useApplication } from 'hooks/application';

export const RightSidebar = observer(() => {
  const { updateTabData, activeTab: tab } = useApplication();

  const updateDate = (date: Date) => {
    updateTabData({ date });
  };

  return (
    <div className="h-full flex justify-center border-l border-border pt-10">
      <div className="w-full border-t border-border mt-2">
        <Calendar
          mode="single"
          selected={tab.data.date}
          onSelect={(date: Date) => {
            updateDate(date);
          }}
        />
      </div>
    </div>
  );
});
