import { Button, SendLine } from '@tegonhq/ui';
import { useState } from 'react';

import { AdjustableTextArea } from 'common/adjustable-textarea';

interface ConversationTextareaProps {
  onSend: (value: string) => void;
}

export function ConversationTextarea({ onSend }: ConversationTextareaProps) {
  const [text, setText] = useState('');

  return (
    <div className="p-4">
      <div className="flex flex-col rounded pt-2 bg-grayAlpha-100">
        <AdjustableTextArea
          className="bg-transparent max-h-[500px] overflow-auto px-3"
          placeholderClassName="px-3"
          value={text}
          autoFocus
          onChange={(e) => setText(e)}
          placeholder="Ask AI anything..."
        />
        <div className="flex justify-end p-2">
          <Button
            variant="ghost"
            className="transition-all duration-500 ease-in-out"
            type="submit"
            onClick={() => {
              onSend(text);
              setText('');
            }}
          >
            <SendLine size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
