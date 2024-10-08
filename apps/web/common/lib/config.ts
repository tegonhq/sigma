import Passwordless from 'supertokens-auth-react/recipe/passwordless';
import SessionReact from 'supertokens-auth-react/recipe/session';

export const frontendConfig = () => {
  const appInfo = {
    appName: 'Tegon',
    apiDomain: process.env.NEXT_PUBLIC_BACKEND_HOST,
    websiteDomain: process.env.NEXT_PUBLIC_BASE_HOST,
    apiBasePath: '/auth',
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
            window.location.href = href;
          },
        },
      };
    },
  };
};
