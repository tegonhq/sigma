import { observer } from 'mobx-react-lite';
import { useHotkeys } from 'react-hotkeys-hook';
import { Key } from 'ts-key-enum';

import { SCOPES } from 'common/shortcut-scopes';

import { useApplication } from 'hooks/application';

export const Navigation = observer(() => {
  const { back, forward } = useApplication();

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

  return <></>;
});
