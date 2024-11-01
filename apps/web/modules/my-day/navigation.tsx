import { Button } from '@sigma/ui/components/button';
import { ArrowLeft, ArrowRight } from '@sigma/ui/icons';
import { observer } from 'mobx-react-lite';

import { useApplication } from 'hooks/application';

export const Navigation = observer(() => {
  const { tab } = useApplication();

  return (
    <div className="flex -ml-2">
      <Button variant="ghost">
        <ArrowLeft size={18} />
      </Button>
      <Button variant="ghost">
        <ArrowRight size={18} />
      </Button>
    </div>
  );
});
