import { ScrollArea } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';

import { PageTitle } from 'modules/tasks/single-task/single-task-title';

import { RightSideLayout } from 'layouts/right-side-layout';

import { useUpdatePageMutation } from 'services/pages';

import { useContextStore } from 'store/global-context-provider';

import { ListPageEditor } from './list-page-editor';
import { ListPageHeader } from './list-page-header';

interface TabsProps {
  entity_id: string;
}

export const ListPage = observer(({ entity_id }: TabsProps) => {
  const { listsStore, pagesStore } = useContextStore();
  const list = listsStore.getListWithId(entity_id);
  const page = pagesStore.getPageWithId(list?.pageId);
  const { mutate: updatePage } = useUpdatePageMutation({});

  const onChange = (title: string) => {
    updatePage({
      pageId: page.id,
      title,
    });
  };

  return (
    <RightSideLayout header={<ListPageHeader list={list} />}>
      <ScrollArea className="w-full h-full flex justify-center p-4">
        <div className="flex h-full justify-center w-full">
          <div className="grow flex flex-col gap-2 h-full max-w-[97ch]">
            <div>
              <PageTitle value={page?.title} onChange={onChange} />
            </div>

            <div className="flex flex-col gap-0">
              {page && <ListPageEditor page={page} list={list} />}
            </div>
          </div>
        </div>
      </ScrollArea>
    </RightSideLayout>
  );
});
