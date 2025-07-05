// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    // sendPing: (host: any) => ipcRenderer.send('ping-request', host),

    sendPing: async (host: string) => ipcRenderer.invoke('ping-request', host),

    onPingResponse: (callback: (arg0: any) => void) =>
      ipcRenderer.on('ping-response', (_event, data) => callback(data)),

    connectSSH: (ip: any) => ipcRenderer.send('connect-ssh', ip),

    connectRemotely: (ip: any) => ipcRenderer.send('connect-remotely', ip),

    readServerIp: async () => ipcRenderer.invoke('read-servers'),

    // alertDown: (ip: any, name: any) => ipcRenderer.send('alert-down', ip, name),

    // onNotif: (callback: (arg0: any) => void) =>
    //   ipcRenderer.on('send-notif', (_event, data) => callback(data)),
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
