/* eslint-disable react/no-unescaped-entities */
import { Button } from '@redplanethq/ui';
import { RiGoogleLine } from '@remixicon/react';
import getConfig from 'next/config';
import { useRouter } from 'next/router';
import React from 'react';
import { getAuthorisationURLWithQueryParamsAndSetState } from 'supertokens-auth-react/recipe/thirdparty';
import { z } from 'zod';

import { AuthGuard } from 'common/wrappers';

import { useIPC } from 'hooks/ipc';
import { useIsElectron } from 'hooks/use-is-electron';

import {
  useCreateAuthCodeMutation,
  type AuthCodeResponse,
} from 'services/users';

import { AuthLayout } from './layout';
import { getCookies } from './utils';
const { publicRuntimeConfig } = getConfig();

export const AuthSchema = z.object({
  email: z.string().email(),
  otp: z.string().optional(),
});

export function Auth() {
  const router = useRouter();
  const {
    query: { redirectToPath },
  } = router;

  const [loading, setLoading] = React.useState(false);

  const { mutate: createAuthCode, isLoading } = useCreateAuthCodeMutation({
    onSuccess: async (data: AuthCodeResponse) => {
      setLoading(true);
      ipc.openUrl(
        `${publicRuntimeConfig.NEXT_PUBLIC_NODE_ENV === 'production' ? 'https://app.mysigma.ai' : publicRuntimeConfig.NEXT_PUBLIC_BASE_HOST}/authorize?code=${data.code}`,
      );

      try {
        await getCookies(data.code);
        router.replace('/home');
      } catch (e) {}

      setLoading(false);
    },
  });

  const isElectron = useIsElectron();
  const ipc = useIPC();

  const onLogin = () => {
    createAuthCode();
  };

  async function googleSignInClicked() {
    try {
      // Store redirectToPath in localStorage if it exists
      if (redirectToPath) {
        localStorage.removeItem('redirectToPath');
        localStorage.setItem('redirectToPath', redirectToPath as string);
      }

      const authUrl = await getAuthorisationURLWithQueryParamsAndSetState({
        thirdPartyId: 'google',

        // This is where Google should redirect the user back after login or error.
        // This URL goes on the Google's dashboard as well.
        frontendRedirectURI: `https://app.mysigma.ai/auth/google`,
      });

      /*
        Example value of authUrl: https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email&access_type=offline&include_granted_scopes=true&response_type=code&client_id=1060725074195-kmeum4crr01uirfl2op9kd5acmi9jutn.apps.googleusercontent.com&state=5a489996a28cafc83ddff&redirect_uri=https%3A%2F%2Fsupertokens.io%2Fdev%2Foauth%2Fredirect-to-app&flowName=GeneralOAuthFlow
        */

      // we redirect the user to google for auth.
      window.location.assign(authUrl);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.isSuperTokensGeneralError === true) {
        // this may be a custom error message sent from the API by you.
        window.alert(err.message);
      } else {
        window.alert('Oops! Something went wrong.');
      }
    }
  }

  if (isElectron) {
    return (
      <AuthGuard>
        <AuthLayout>
          <div className="flex flex-col w-[360px] items-center">
            <h1 className="text-lg text-center">Welcome</h1>
            <div className="text-center text-muted-foreground mt-1 mb-8">
              Your second brain, supercharging dev life with AI.
            </div>
            <Button
              variant="secondary"
              className="w-fit"
              onClick={onLogin}
              isLoading={isLoading || loading}
            >
              Login
            </Button>
          </div>
        </AuthLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <AuthLayout>
        <div className="flex flex-col w-[360px]">
          <h1 className="text-lg text-center">Welcome</h1>
          <div className="text-center text-muted-foreground mt-1 mb-8">
            Your second brain, supercharging dev life with AI.
          </div>

          <div className="flex flex-col gap-2 items-center">
            <Button
              variant="secondary"
              className="gap-2 w-fit"
              onClick={googleSignInClicked}
            >
              <RiGoogleLine size={16} /> Login with google
            </Button>
          </div>
        </div>
      </AuthLayout>
    </AuthGuard>
  );
}
