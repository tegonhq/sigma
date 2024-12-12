/* eslint-disable @typescript-eslint/no-explicit-any */
interface IPCRenderer {
  sendMessage(channel: string, ...args: any[]): void;
  on(channel: string[], listener: (event: any, ...args: any[]) => void): void;
  once(channel: string, listener: (event: any, ...args: any[]) => void): void;
  onWindowStateChange(callback: (state: string) => void): void;
  openUrl: (url: string) => void;
}

export const useIPC = (): IPCRenderer => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof window !== 'undefined'
    ? (window as any)?.electron?.ipcRenderer
    : undefined;
};
