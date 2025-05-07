import { Button, Close } from '@tegonhq/ui';
import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import React from 'react';

import { UserContext } from 'store/user-context';

interface HeaderProps {
  onClose: () => void;
}

export const Header = observer(({ onClose }: HeaderProps) => {
  const user = React.useContext(UserContext);

  return (
    <div className="flex justify-between p-4 w-full items-center">
      <div className="flex gap-1 items-center font-medium font-mono grow header">
        <Image
          src="/logo_light.svg"
          alt="logo"
          key={1}
          width={24}
          height={24}
        />
        Hi {user?.fullname}
      </div>

      <div className="flex">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <Close size={14} />
        </Button>
      </div>
    </div>
  );
});
