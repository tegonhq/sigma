import { observer } from 'mobx-react-lite';
import Image from 'next/image';
import React from 'react';

import { UserContext } from 'store/user-context';

export const Header = observer(() => {
  const user = React.useContext(UserContext);

  return (
    <div className="flex justify-between p-4 w-full items-center header">
      <div className="flex gap-1 items-center font-medium font-mono">
        <Image
          src="/logo_light.svg"
          alt="logo"
          key={1}
          width={24}
          height={24}
        />
        Hi {user?.fullname}
      </div>
    </div>
  );
});
