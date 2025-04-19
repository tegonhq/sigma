import { cn } from '@tegonhq/ui';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

import { getIcon, type IconType } from 'common/icon-utils';

export interface Agent {
  name: string;
  key: string;
}

interface MentionListProps {
  items: Agent[];
  command: (args: { id: string }) => void;
}

export const MentionList = forwardRef(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (props: MentionListProps, ref: React.Ref<any>) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectItem = (index: number) => {
      const item = props.items[index];

      if (item) {
        props.command({ id: item.key });
      }
    };

    const upHandler = () => {
      setSelectedIndex(
        (prevIndex) =>
          (prevIndex + props.items.length - 1) % props.items.length,
      );
    };

    const downHandler = () => {
      setSelectedIndex((prevIndex) => (prevIndex + 1) % props.items.length);
    };

    const enterHandler = () => {
      selectItem(selectedIndex);
    };

    useEffect(() => {
      setSelectedIndex(0);
    }, [props.items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        switch (event.key) {
          case 'ArrowUp':
            upHandler();
            return true;
          case 'ArrowDown':
            downHandler();
            return true;
          case 'Enter':
            enterHandler();
            return true;
          default:
            return false;
        }
      },
    }));

    return (
      <div className="bg-popover border border-border rounded shadow flex flex-col gap-0.5 overflow-auto p-1 relative">
        {props.items.length > 0 ? (
          props.items.map((item, index) => {
            const Icon = getIcon(item.key as IconType);

            return (
              <button
                className={cn(
                  'flex items-center gap-1 w-full text-left bg-transparent hover:bg-grayAlpha-100 p-1 px-2',
                  index === selectedIndex ? 'bg-grayAlpha-100 rounded-sm' : '',
                )}
                key={index}
                onClick={() => selectItem(index)}
              >
                <Icon size={14} className="rounded-sm" />
                {item.name}
              </button>
            );
          })
        ) : (
          <div className="item">No result</div>
        )}
      </div>
    );
  },
);

MentionList.displayName = 'MentionList';
