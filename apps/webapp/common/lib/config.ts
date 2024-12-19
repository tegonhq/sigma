import Passwordless from 'supertokens-auth-react/recipe/passwordless';
import SessionReact from 'supertokens-auth-react/recipe/session';

import type { NextRouter } from 'next/router';

export const frontendConfig = (router: NextRouter) => {
  const appInfo = {
    appName: 'Sigma',
    apiDomain: process.env.NEXT_PUBLIC_BASE_HOST,
    websiteDomain: process.env.NEXT_PUBLIC_BASE_HOST,
    apiBasePath: '/api/auth',
    websiteBasePath: '/auth',
  };

  return {
    appInfo,
    recipeList: [
      Passwordless.init({
        contactMethod: 'EMAIL',
      }),
      SessionReact.init(),
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    windowHandler: (oI: any) => {
      return {
        ...oI,
        location: {
          ...oI.location,
          setHref: (href: string) => {
            router.push(href);
          },
        },
      };
    },
  };
};
