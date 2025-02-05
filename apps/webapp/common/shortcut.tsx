import { cn } from '@tegonhq/ui';

interface ShortcutProps {
  shortcut: string;
  className?: string;
}

export const Shortcut = ({ shortcut, className }: ShortcutProps) => {
  return (
    <span className={cn('text-xs text-muted-foreground', className)}>
      {shortcut}
    </span>
  );
};
