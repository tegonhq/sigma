import { cn } from '@tegonhq/ui';
import * as React from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { AdjustableTextArea } from 'common/adjustable-textarea';

interface PageTitleProps {
  value: string;
  onChange?: (value: string) => void;
  autoFocus?: boolean;
  className?: string;
}
// When the issue title changes in the background this doesn't get updated
// TODO: fix this
export const PageTitle = React.forwardRef(
  ({ value, onChange, autoFocus, className }: PageTitleProps) => {
    const [inputValue, setInputValue] = React.useState(value);
    const [updatedFromComponent, setUpdatedFromComponent] =
      React.useState(false);

    React.useEffect(() => {
      if (value !== inputValue && !updatedFromComponent) {
        setInputValue(value);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, updatedFromComponent]);

    const debouncedUpdates = useDebouncedCallback(async (title: string) => {
      onChange && onChange(title);
    }, 500);

    const onInputChange = (title: string) => {
      setUpdatedFromComponent(true);
      setInputValue(title);
      debouncedUpdates(title);
    };

    return (
      <AdjustableTextArea
        value={inputValue}
        autoFocus={autoFocus}
        className={cn(
          'border-0 px-0 py-0 font-medium resize-none bg-transparent no-scrollbar overflow-hidden outline-none focus-visible:ring-0 text-[28px]',
          className,
        )}
        placeholderClassName="text-xl"
        onChange={onInputChange}
        placeholder="Untitled"
      />
    );
  },
);

PageTitle.displayName = 'PageTitle';
