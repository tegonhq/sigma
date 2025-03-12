import { observer } from 'mobx-react-lite';

import { RightSideLayout } from 'layouts/right-side-layout';

import { Day } from './day';
import { Header } from './header';

export const MyDay = observer(() => {
  return (
    <RightSideLayout header={<Header />}>
      <Day />
    </RightSideLayout>
  );
});
