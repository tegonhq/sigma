'use client';

import { Loader, Logo, useToast } from '@tegonhq/ui';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import { SessionAuth } from 'supertokens-auth-react/recipe/session';

import { useAuthorizeMutation } from 'services/users';

export function Authorize() {
  const search = useSearchParams();
  const [loading, setLoading] = React.useState(true);
  const code = search.get('code');
  const { toast } = useToast();

  const { mutate: authorize } = useAuthorizeMutation({
    onError: (error) => {
      setLoading(false);
      toast({
        title: 'Token error!',
        description: error,
      });
    },
    onSuccess: () => {
      setLoading(false);
    },
  });

  React.useEffect(() => {
    authorize({
      code: code as string,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <Loader text="Verifying token" />;
  }

  return (
    <SessionAuth>
      <div className="p-6 container flex items-center flex-col gap-2">
        <Logo width={100} height={100} />
        You have successfully authorised, now you can return back to the cli.
      </div>
    </SessionAuth>
  );
}
