import { Loader, useToast } from '@tegonhq/ui';
import React from 'react';
import { signInAndUp } from 'supertokens-auth-react/recipe/thirdparty';

export function Google() {
  const { toast } = useToast();

  async function handleGoogleCallback() {
    try {
      const response = await signInAndUp();

      if (response.status === 'OK') {
        const redirectToPath = localStorage.getItem('redirectToPath');

        if (redirectToPath) {
          localStorage.removeItem('redirectToPath');
        }

        window.location.assign(
          redirectToPath ? (redirectToPath as string) : '/',
        );
      } else if (response.status === 'SIGN_IN_UP_NOT_ALLOWED') {
        // the reason string is a user friendly message
        // about what went wrong. It can also contain a support code which users
        // can tell you so you know why their sign in / up was not allowed.
        toast({ title: 'Error', description: response.reason });
      } else {
        // SuperTokens requires that the third party provider
        // gives an email for the user. If that's not the case, sign up / in
        // will fail.

        // As a hack to solve this, you can override the backend functions to create a fake email for the user.

        toast({
          title: 'Error',
          description:
            'No email provided by social login. Please use another form of login',
        });

        window.location.assign('/auth'); // redirect back to login page
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.isSuperTokensGeneralError === true) {
        // this may be a custom error message sent from the API by you.
        toast({
          title: 'Error',
          description: err.message,
        });
      } else {
        toast({
          title: 'Error',
          description: 'Oops! Something went wrong.',
        });
      }
    }
  }

  React.useEffect(() => {
    handleGoogleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Loader text="Signing in..." />;
}
