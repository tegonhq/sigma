import { Button } from '@sigma/ui/components/button';
import { SidebarLine } from '@sigma/ui/icons';
import { observer } from 'mobx-react-lite';

import { useContextStore } from 'store/global-context-provider';

export const SidebarExpand = observer(() => {
  const { applicationStore } = useContextStore();

  return (
    <Button
      variant="link"
      size="sm"
      onClick={() => {
        applicationStore.updateSideBar(!applicationStore.sidebarCollapsed);
      }}
    >
      <SidebarLine size={18} />
    </Button>
  );
});
