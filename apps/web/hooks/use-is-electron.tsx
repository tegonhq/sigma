export const useIsElectron = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any)?.electron;
};
