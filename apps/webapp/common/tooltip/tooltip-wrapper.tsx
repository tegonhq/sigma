import type { ReactNode } from 'react';

import { cn, Tooltip, TooltipContent, TooltipTrigger } from '@tegonhq/ui';

interface TooltipWrapperProps {
  tooltip: ReactNode;
  children: ReactNode;
  className?: string;
  tooltipClassName?: string;
  disabled?: boolean;
}

export function TooltipWrapper({
  tooltip,
  children,
  className,
  tooltipClassName,
  disabled = false,
}: TooltipWrapperProps) {
  // If no tooltip is provided or wrapper is disabled, return just the children
  if (!tooltip || disabled) {
    return <div className={cn(className)}>{children}</div>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(className)}>{children}</div>
      </TooltipTrigger>
      <TooltipContent className={cn('p-2', tooltipClassName)}>
        <span>{tooltip}</span>
      </TooltipContent>
    </Tooltip>
  );
}
