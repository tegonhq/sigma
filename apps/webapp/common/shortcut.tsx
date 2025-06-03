import { cn } from '@redplanethq/ui';

interface ShortcutProps {
  shortcut: string;
  className?: string;
}

export const Shortcut = ({ shortcut, className }: ShortcutProps) => {
  return (
    <span className={cn('text-sm text-muted-foreground', className)}>
      {shortcut}
    </span>
  );
};
