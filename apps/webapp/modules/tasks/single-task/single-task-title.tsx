import * as React from "react";
import { useDebouncedCallback } from "use-debounce";

import { AdjustableTextArea } from "common/adjustable-textarea";
interface PageTitleProps {
  value: string;
  onChange?: (value: string) => void;
  autoFocus?: boolean;
}
// When the issue title changes in the background this doesn't get updated
// TODO: fix this
export function PageTitle({ value, onChange, autoFocus }: PageTitleProps) {
  const [inputValue, setInputValue] = React.useState(value);

  React.useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const debouncedUpdates = useDebouncedCallback(async (title: string) => {
    onChange && onChange(title);
  }, 500);

  const onInputChange = (title: string) => {
    setInputValue(title);
    debouncedUpdates(title);
  };

  return (
    <AdjustableTextArea
      value={inputValue}
      autoFocus={autoFocus}
      className="border-0 px-0 py-0 font-medium resize-none bg-transparent no-scrollbar overflow-hidden outline-none focus-visible:ring-0 text-xl"
      onChange={onInputChange}
      placeholder="Untitled"
    />
  );
}
