/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    electron: {
      // Add specific methods or properties you expose to the renderer
      ipcRenderer: {
        sendMessage(channel: string, ...args: any[]): void;
        on(
          channel: string,
          listener: (event: any, ...args: any[]) => void,
        ): void;
        once(
          channel: string,
          listener: (event: any, ...args: any[]) => void,
        ): void;
      };
    };
  }
}
