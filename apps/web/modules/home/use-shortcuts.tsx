import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { SCOPES } from 'common/shortcut-scopes';

import { useApplication } from 'hooks/application';

export const useShortcuts = () => {
  const {
    rightScreenCollapsed,
    updateRightScreen,
    updateSideBar,
    sidebarCollapsed,
    back,
    forward,
  } = useApplication();

  useHotkeys(
    `${Key.Meta}+${Key.Shift}+b, ${Key.Meta}+${Key.Shift}, ${Key.Meta}+[ , ${Key.Meta}+]`,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event) => {
      const isShiftPressed = event.shiftKey;
      switch (event.key) {
        case 'b':
          if (isShiftPressed) {
            updateRightScreen(!rightScreenCollapsed);
          } else {
            updateSideBar(!sidebarCollapsed);
          }
          break;
        case '[':
          back();
          break;
        case ']':
          forward();
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
