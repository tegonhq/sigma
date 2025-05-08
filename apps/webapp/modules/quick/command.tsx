import { cn, CommandItem, CommandList, Input } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import React, { useRef } from 'react';

import { QuickConverstion } from 'modules/conversation';
import { useSearchCommandsQuick } from 'modules/search/command/use-search-commands';

import { Footer } from './footer';

interface CommandComponentProps {
  onClose: () => void;
  conversationId: string;
  setConversationId: (value: string | undefined) => void;
  AI: boolean;
  setAI: (value: boolean) => void;
}

export const CommandComponent = observer(
  ({
    onClose,
    conversationId,
    setConversationId,
    AI,
    setAI,
  }: CommandComponentProps) => {
    const [value, setValue] = React.useState('');
    const commands = useSearchCommandsQuick(value, onClose);
    const ref = useRef(null);

    React.useEffect(() => {
      setTimeout(() => {
        if (ref.current) {
          ref.current.focus();
        }
      }, 100);
    }, []);

    const defaultCommands = () => {
      const defaultCommands = commands['default'];

      return (
        <>
          {defaultCommands.map((command, index: number) => {
            return (
              <CommandItem
                onSelect={() => {
                  setAI(true);
                }}
                key={`default__${index}`}
                className="flex gap-2 items-center py-2"
              >
                <command.Icon size={16} />
                <div className="grow">{command.text}</div>
              </CommandItem>
            );
          })}
        </>
      );
    };

    const pagesCommands = () => {
      const pagesCommands = commands['Pages'];

      if (!pagesCommands) {
        return null;
      }

      return (
        <>
          {pagesCommands.map((command, index: number) => {
            return (
              <CommandItem
                onSelect={command.command}
                key={`page__${index}`}
                className="flex gap-1 items-center py-2"
              >
                <div className="inline-flex items-center gap-2 min-w-[0px]">
                  <command.Icon size={16} className="shrink-0" />
                  <div className="truncate"> {command.text}</div>
                </div>
              </CommandItem>
            );
          })}
        </>
      );
    };

    if (AI) {
      return (
        <QuickConverstion
          conversationId={conversationId}
          setConversationId={setConversationId}
          defaultValue={value}
          onClose={() => {
            setAI(false);
            setConversationId(undefined);
            setValue('');
          }}
        />
      );
    }

    return (
      <>
        <div className="flex items-center px-3" cmdk-input-wrapper="">
          <div className="w-5 h-5 header">
            <Image
              src="/logo_light.svg"
              alt="logo"
              key={1}
              width={20}
              height={20}
              className=""
            />
          </div>
          <Input
            placeholder="Ask sigma..."
            autoFocus
            ref={ref}
            value={value}
            onChange={(e) => setValue(e.currentTarget.value)}
            className={cn(
              'flex h-12 w-full rounded-md bg-transparent py-3 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
            )}
          />
        </div>

        <CommandList className="px-2 grow">
          {defaultCommands()}
          {pagesCommands()}
        </CommandList>

        <Footer />
      </>
    );
  },
);
