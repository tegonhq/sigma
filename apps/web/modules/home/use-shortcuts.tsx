import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { SCOPES } from 'common/shortcut-scopes';

import { useApplication } from 'hooks/application';

import { TabViewType } from 'store/application';

export const useShortcuts = () => {
  const { updateRightScreen } = useApplication();

  useHotkeys(
    [`${Key.Meta}+u`, `${Key.Meta}+i`, `${Key.Meta}+o`],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event) => {
      const isMetaKey = event.metaKey;
      switch (event.key) {
        case 'u':
          if (isMetaKey) {
            updateRightScreen(TabViewType.ACTIVITY);
          }
          break;
        case 'i':
          if (isMetaKey) {
            updateRightScreen(TabViewType.AI);
          }
          break;
        case 'o':
          if (isMetaKey) {
            updateRightScreen(TabViewType.MY_TASKS);
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
