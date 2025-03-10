import type { User } from './types';

import {
  AvatarText,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  cn,
} from '@tegonhq/ui';

interface UserAvatarProps {
  user: User;
  showFull?: boolean;
  className?: string;
}

export function UserAvatar({
  user,
  showFull = false,
  className,
}: UserAvatarProps) {
  if (!user) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(className)}>
          <AvatarText text={user.fullname} className="w-5 h-5 text-[9px]" />

          {showFull && <> {user.fullname}</>}
        </div>
      </TooltipTrigger>
      <TooltipContent className="p-2">
        <div className="flex gap-2 items-center">
          <AvatarText text={user.fullname} className="w-5 h-5 text-[9px]" />

          {user.fullname}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
