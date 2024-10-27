import { Button } from '@sigma/ui/components/button';
import { ArrowLeft, ArrowRight } from '@sigma/ui/icons';
import { useApplication } from 'hooks/application';
import { observer } from 'mobx-react-lite';

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
