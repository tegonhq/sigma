export const useIsElectron = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any)?.electron;
};
