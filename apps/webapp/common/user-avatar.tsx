import type { User } from './types';

import { AvatarText, cn } from '@redplanethq/ui';

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
    <div className={cn(className)}>
      <AvatarText text={user.fullname} className="w-5 h-5 text-[9px]" />

      {showFull && <> {user.fullname}</>}
    </div>
  );
}
