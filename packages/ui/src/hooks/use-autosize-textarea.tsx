import * as React from 'react';

// Updates the height of a <textarea> when the value changes.
export const useAutoSizeTextArea = (
  id: string,
  textAreaRef: HTMLTextAreaElement | null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
) => {
  React.useLayoutEffect(() => {
    const textArea = textAreaRef ?? document.getElementById(id);

    if (textArea && textArea.style && value) {
      // We need to reset the height momentarily to get the correct scrollHeight for the textarea
      textArea.style.height = 'auto';
      const scrollHeight = textArea.scrollHeight;

      // We then set the height directly, outside of the render loop
      // Trying to set this with state or a ref will product an incorrect value.
      textArea.style.height = `${10 + scrollHeight}px`;
    }
  }, [textAreaRef, value, id]);
};
