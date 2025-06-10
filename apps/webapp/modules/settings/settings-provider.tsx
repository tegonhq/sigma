import { useRouter } from 'next/router';

export const useSettings = () => {
  const router = useRouter();

  const openSettings = (page?: string) => {
    router.push({
      pathname: '/settings',
      query: { ...router.query, settings: page },
    });
  };

  return {
    openSettings,
  };
};
