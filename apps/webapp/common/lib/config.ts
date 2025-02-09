import getConfig from 'next/config';
import Router from 'next/router';
import Passwordless from 'supertokens-auth-react/recipe/passwordless';
import SessionReact from 'supertokens-auth-react/recipe/session';
import ThirdParty, { Google } from 'supertokens-auth-react/recipe/thirdparty';

const { publicRuntimeConfig } = getConfig();

export const frontendConfig = () => {
  const appInfo = {
    appName: 'Sigma',
    apiDomain: publicRuntimeConfig.NEXT_PUBLIC_BASE_HOST,
    websiteDomain: publicRuntimeConfig.NEXT_PUBLIC_BASE_HOST,
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
      ThirdParty.init({
        signInAndUpFeature: {
          providers: [Google.init()],
        },
      }),
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    windowHandler: (oI: any) => {
      return {
        ...oI,
        location: {
          ...oI.location,
          setHref: (href: string) => {
            Router.push(href);
          },
        },
      };
    },
  };
};
