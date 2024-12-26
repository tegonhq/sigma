import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { SCOPES } from 'common/shortcut-scopes';

import { useApplication } from 'hooks/application';

import { TabViewType } from 'store/application';

export const useShortcuts = () => {
  const { updateRightScreen, tabs } = useApplication();

  useHotkeys(
    [`${Key.Meta}+l`],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event) => {
      const isMetaKey = event.metaKey;
      switch (event.key) {
        case 'l':
          if (isMetaKey) {
            const tab = tabs[0];
            if (tab.type !== TabViewType.AI) {
              updateRightScreen(TabViewType.AI);
            }
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
};
