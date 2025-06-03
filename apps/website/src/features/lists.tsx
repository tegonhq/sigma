import { Button, Project } from '@redplanethq/ui';

export const Lists = () => {
  return (
    <div className="flex flex-col flex-1">
      <h3 className="text-xl font-semibold text-foreground mb-1 text-left flex gap-1 items-center">
        Lists
      </h3>
      <p className="text-base text-muted-foreground text-left">
        Your Swiss-army doc for everything—code snippets, side-projects, grocery
        runs.
      </p>

      <div className="flex flex-col mt-2 gap-1">
        <Button variant="secondary" className="w-fit gap-2 h-7">
          <Project size={16} /> Sigma
        </Button>
        <Button variant="secondary" className="w-fit gap-2 h-7">
          <Project size={16} /> Groceries
        </Button>
        <Button variant="secondary" className="w-fit gap-2 h-7">
          <Project size={16} /> IOT project
        </Button>
      </div>
    </div>
  );
};
