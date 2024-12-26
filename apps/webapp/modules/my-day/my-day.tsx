import { observer } from 'mobx-react-lite';

import { AILayout } from 'layouts/ai-layout';

import { Day } from './day';
import { Header } from './header';

export const MyDay = observer(() => {
  return (
    <AILayout header={<Header />}>
      <Day />
    </AILayout>
  );
});
