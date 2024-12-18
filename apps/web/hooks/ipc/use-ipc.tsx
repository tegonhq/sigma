'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IPCRenderer {
  sendMessage(channel: string, ...args: any[]): void;
  on(channel: string[], listener: (event: any, ...args: any[]) => void): void;
  once(channel: string, listener: (event: any, ...args: any[]) => void): void;
  onWindowStateChange(callback: (state: string) => void): void;
  openUrl: (url: string) => void;
  getIntegrationsFolder: () => Promise<string>;
}

export const useIPC = (): IPCRenderer => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any)?.electron?.ipcRenderer;
};
