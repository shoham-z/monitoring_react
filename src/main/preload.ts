// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { Notification } from '../main/util';

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

    sendPingVisible: async (host: string) => {
      ipcRenderer.send('ping-request-visible', host);
      ipcRenderer.invoke('ping-request', host);
    },

    connectSSH: (ip: any) => ipcRenderer.send('connect-ssh', ip),

    connectRemotely: (ip: any) => ipcRenderer.send('connect-remotely', ip),

    getVars: async () =>
      ipcRenderer.invoke('get-vars'),

    saveSwitchList: async (switchList: any[]) =>
      ipcRenderer.invoke('save-switch-list', switchList),

    loadSwitchList: async () =>
      ipcRenderer.invoke('load-switch-list'),

    appendNotification: async (notification: Notification) => ipcRenderer.invoke('append-notification', notification),

    readNotifications: async () => ipcRenderer.invoke('read-notifications'),

    pingAllDevices: (callback: () => void) => ipcRenderer.on('ping-all-devices', (_event) => callback())
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
