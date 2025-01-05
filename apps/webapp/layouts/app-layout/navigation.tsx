import {
  ArrowLeft,
  ArrowRight,
  Button,
  SidebarLine,
  useSidebar,
} from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { SCOPES } from 'common/shortcut-scopes';

import { useApplication } from 'hooks/application';

import { historyManager } from 'store/history';

export const Navigation = observer(() => {
  const { back, forward } = useApplication();

  const { toggleSidebar } = useSidebar();

  useHotkeys(
    [`${Key.Meta}+[`, `${Key.Meta}+]`],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event) => {
      const isMetaKey = event.metaKey;

      switch (event.key) {
        case ']':
          if (isMetaKey) {
            forward();
          }
          break;
        case '[':
          if (isMetaKey) {
            back();
          }
          break;

        default:
          break;
      }
    },
    {
      scopes: [SCOPES.Global],
      enableOnFormTags: true,
      enableOnContentEditable: true,
    },
  );

  return (
    <div className="flex gap-1 items-center">
      <Button size="sm" variant="ghost" onClick={toggleSidebar}>
        <SidebarLine size={16} />
      </Button>
      <Button
        size="xs"
        variant="ghost"
        onClick={back}
        disabled={!historyManager.canGoBack}
      >
        <ArrowLeft size={14} />
      </Button>
      <Button
        size="xs"
        variant="ghost"
        onClick={forward}
        disabled={!historyManager.canGoForward}
      >
        <ArrowRight size={14} />
      </Button>
    </div>
  );
});
