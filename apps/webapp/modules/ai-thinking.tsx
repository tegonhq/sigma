import { observer } from 'mobx-react-lite';
import Image from 'next/image';

import { useContextStore } from 'store/global-context-provider';

export const AIThinking = observer(() => {
  const { agentWorklogsStore } = useContextStore();
  const agentWorking = agentWorklogsStore.agentWorklogs.length > 0;

  if (!agentWorking) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-2 bg-background-3 shadow-1 rounded-md px-3 py-2">
        <Image
          src="/logo_light.svg"
          alt="logo"
          key={1}
          width={20}
          height={20}
        />
        <span
          className="text-sm font-medium text-muted-foreground bg-gradient-to-r from-[#F48FD7] via-[#6528FD] to-[#F48FD7] 
            bg-[length:200%_100%] bg-clip-text text-transparent animate-gradient-slide"
        >
          Thinking...
        </span>
      </div>
    </div>
  );
});
