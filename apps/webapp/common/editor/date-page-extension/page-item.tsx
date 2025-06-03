import { DocumentLine } from '@redplanethq/ui';
import { parse } from 'date-fns';
import { observer } from 'mobx-react-lite';

import type { PageType } from 'common/types';

import { useApplication } from 'hooks/application';

import { TabViewType } from 'store/application';

interface PageItemProps {
  page: PageType;
}

export const PageItem = observer(({ page }: PageItemProps) => {
  const { changeActiveTab } = useApplication();

  const openPage = () => {
    changeActiveTab(TabViewType.DAYS, {
      data: {
        date: parse(page.title, 'dd-MM-yyyy', new Date()),
      },
    });
  };

  return (
    <a
      className="gap-1 bg-grayAlpha-100 py-0.5 px-1 rounded box-decoration-clone"
      contentEditable={false}
      onClick={openPage}
    >
      <span>
        <span className="inline-flex items-center gap-1 justify-bottom top-1 relative">
          <DocumentLine size={16} />
        </span>
      </span>
      <span className="ml-1">{page?.title}</span>
    </a>
  );
});
