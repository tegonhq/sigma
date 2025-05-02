import { cn } from '@tegonhq/ui';
import React from 'react';

interface OnboardingHighlightProps {
  children: React.ReactNode;
  className?: string;
  highlight?: boolean;
}

export function OnboardingHighlight({
  children,
  className,
  highlight = false,
}: OnboardingHighlightProps) {
  return (
    <div
      className={cn(
        'transition-all duration-200',
        highlight && 'ring-2 ring-primary ring-offset-2',
        className,
      )}
    >
      {children}
    </div>
  );
}
