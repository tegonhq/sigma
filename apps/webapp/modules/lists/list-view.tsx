import { Card, CardHeader } from '@redplanethq/ui';
import { observer } from 'mobx-react-lite';

import { getIcon } from 'common/icon-picker';

import { useApplication } from 'hooks/application';
import { useLists } from 'hooks/list';

import { TabViewType } from 'store/application';
import { useCreateListMutation } from 'services/lists';
import { PlusIcon } from 'lucide-react';

export const ListView = observer(() => {
  const lists = useLists();
  const { changeActiveTab } = useApplication();
  const { mutate: createList } = useCreateListMutation({});

  return (
    <div className="flex gap-1 px-4 mt-10 justify-center flex-wrap">
      <div className="flex gap-2 max-w-[97ch] w-full flex-wrap justify-center">
        {lists.map((list, index) => (
          <Card
            key={index}
            className="w-[200px] hover:shadow"
            onClick={() => {
              changeActiveTab(TabViewType.LIST, { entityId: list.id });
            }}
          >
            <CardHeader>
              <div>{getIcon(list?.icon, 24)}</div>
              <div className="text-md">{list.name}</div>
            </CardHeader>
          </Card>
        ))}

        <Card
          className="w-[200px] hover:shadow text-muted-foreground"
          onClick={() => {
            createList(false, {
              onSuccess: (data) =>
                changeActiveTab(TabViewType.LIST, { entityId: data.id }),
            });
          }}
        >
          <CardHeader>
            <div className="">
              <PlusIcon size={18} />
            </div>
            <div className="text-md">Create list</div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
});
