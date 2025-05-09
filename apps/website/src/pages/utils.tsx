import { Checkbox, cn } from '@tegonhq/ui';

export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn('max-w-5xl mx-auto flex flex-col pt-7 lg:pt-9', className)}
    >
      {children}
    </div>
  );
}

export function Section({
  name,
  color,
  children,
}: {
  name: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <Container>
      <div className="flex flex-col">
        <h2 className="text-lg font-medium text-left mb-4" style={{ color }}>
          {name}
        </h2>

        {children}
      </div>
    </Container>
  );
}

export const TaskItem = ({
  number,
  title,
}: {
  number: string;
  title: string;
}) => {
  return (
    <button
      className={cn(
        'inline-flex max-w-[200px] h-5 items-center text-left mr-1 bg-grayAlpha-100 hover:bg-grayAlpha-200 p-1 text-sm rounded-sm relative top-[2px]',
      )}
    >
      <Checkbox className="shrink-0 h-[14px] w-[14px] ml-1 mr-1 rounded-[6px]" />
      <span className="text-muted-foreground font-mono shrink-0 mr-1">
        T-{number}
      </span>

      <div className="inline-flex items-center justify-start shrink min-w-[0px] min-h-[24px]">
        <div className={cn('text-left truncate text-sm')}>{title}</div>
      </div>
    </button>
  );
};
