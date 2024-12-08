'use client';

import { cn, Button } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';

import { useApplication } from 'hooks/application';

import type { TabViewType } from 'store/application';

interface NavProps {
  links: Array<{
    title: string;
    label?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon?: any;
    href: TabViewType;
    count?: number;
    activePaths?: string[];
  }>;
}

export const Nav = observer(({ links }: NavProps) => {
  const { activeTab: tab, updateTabType } = useApplication();

  return (
    <nav className="grid gap-0.5">
      {links.map((link, index) => {
        const isActive = tab.type === link.href;

        return (
          <div className="flex gap-1 items-center " key={index}>
            <Button
              onClick={() => updateTabType(link.href)}
              variant="link"
              className={cn(
                'flex items-center gap-1 justify-between text-foreground bg-grayAlpha-100 w-fit',
                isActive && 'bg-accent text-accent-foreground',
              )}
            >
              <div className="flex items-center gap-1">
                {link.icon && <link.icon className="h-4 w-4" />}
                {link.title}
                {link.label && (
                  <span className={cn('ml-auto')}>{link.label}</span>
                )}
              </div>
            </Button>
            {link.count > 0 && (
              <div className="h-6 flex items-center px-1 rounded text-xs bg-accent text-accent-foreground">
                {link.count}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
});
