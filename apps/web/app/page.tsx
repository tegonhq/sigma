'use client';

import { Loader } from '@tegonhq/ui';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { SessionAuth } from 'supertokens-auth-react/recipe/session';

import { UserDataWrapper } from 'common/wrappers/user-data-wrapper';

import { UserContext } from 'store/user-context';

export function Home() {
  const user = React.useContext(UserContext);
  const router = useRouter();

  React.useEffect(() => {
    if (user?.workspace) {
      router.replace('/home');
    }

    // Check if they have invites
    else {
      router.replace('/onboarding');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.workspace]);

  return <Loader />;
}

export default function HomeWrapper() {
  return (
    <SessionAuth>
      <UserDataWrapper>
        <Home />
      </UserDataWrapper>
    </SessionAuth>
  );
}
