import { format, subDays, addDays, addWeeks, parse } from 'date-fns';

import { observer } from 'mobx-react-lite';
import { useContextStore } from 'store/global-context-provider';
import { NodeViewWrapper } from '@tiptap/react';
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  TodoLine,
} from '@tegonhq/ui';
import React from 'react';
import { PageItem } from './page-item';
import { useCreatePageMutation } from 'services/pages';
import { PageTypeEnum } from '@sigma/types';
import type { PageType } from 'common/types';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DatePageComponent = observer((props: any) => {
  const { pagesStore } = useContextStore();
  const [value, setValue] = React.useState('');
  const inputRef = React.useRef(null);
  const { mutate: createPage } = useCreatePageMutation({
    onSuccess: (page: PageType) => {
      props.updateAttributes({
        pageId: page.id,
      });
    },
  });

  const pageId = props.node.attrs.pageId;

  React.useEffect(() => {
    if (!pageId && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 10);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId]);

  const onBlur = () => {
    // If there's no value and no task selected, delete the node
    if (!value && !pageId) {
      props.deleteNode();
    }
  };

  const onSelectDate = (dateString: string) => {
    let date;
    try {
      // Try full year format first
      date = parse(dateString, 'dd-MM-yyyy', new Date());
      if (isNaN(date.getTime())) {
        // If invalid, try short year format
        date = parse(dateString, 'dd-MM-yy', new Date());
      }
    } catch (error) {
      console.error('Invalid date format');
      return;
    }

    const page = pagesStore.getDailyPageWithDate(date);

    if (!page) {
      const dateTitle = format(date, 'dd-MM-yyyy');
      createPage({
        sortOrder: pagesStore.getSortOrderForNewPage,
        title: dateTitle,
        type: PageTypeEnum.Daily,
      });
    } else {
      props.updateAttributes({
        pageId: page.id,
      });
    }
  };

  if (!pageId) {
    return (
      <NodeViewWrapper className="react-component-with-content" as="span">
        <Command className="w-fit relative rounded text-base">
          <div className="flex items-center">
            <TodoLine size={20} className="pl-1" />
            <CommandInput
              placeholder="Enter date... (dd-mm-yy)"
              value={value}
              onBlur={onBlur}
              ref={inputRef}
              containerClassName="border-none px-1 w-full"
              className="py-0.5 px-1 h-6 w-full"
              onValueChange={setValue}
            />
          </div>

          <CommandList className="flex-1">
            <CommandItem
              onSelect={() => {
                const yesterday = subDays(new Date(), 1);
                onSelectDate(format(yesterday, 'dd-MM-yy'));
              }}
            >
              Yesterday
            </CommandItem>
            <CommandItem
              onSelect={() => {
                const tomorrow = addDays(new Date(), 1);
                onSelectDate(format(tomorrow, 'dd-MM-yy'));
              }}
            >
              Tomorrow
            </CommandItem>
            <CommandItem
              onSelect={() => {
                const nextWeek = addWeeks(new Date(), 1);
                onSelectDate(format(nextWeek, 'dd-MM-yy'));
              }}
            >
              Next week
            </CommandItem>
            {value && (
              <CommandItem
                onSelect={() => {
                  onSelectDate(value);
                }}
              >
                Date: {value}
              </CommandItem>
            )}
          </CommandList>
        </Command>
      </NodeViewWrapper>
    );
  }

  const page = pagesStore.getPageWithId(pageId);

  return (
    <NodeViewWrapper className="react-component-with-content" as="span">
      <PageItem page={page} />
    </NodeViewWrapper>
  );
});
