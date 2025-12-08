import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
var _ = require('lodash');
import { MyNotification } from '../main/util';
import { validateIPAddress, validateNotification, validateSwitchList } from './validation';

const electronHandler = {
  ipcRenderer: {
    sendPing: async (ip: string) => {
      if(validateIPAddress(ip) !== ip) {
        return;
      }
      return ipcRenderer.invoke('ping-request', ip)
    },

    sendPingVisible: async (ip: string) => {
      if(validateIPAddress(ip) !== ip) {
        return;
      }
      ipcRenderer.send('ping-request-visible', ip)
    },

    connectSSH: (ip: any) => {
      if(validateIPAddress(ip) !== ip) {
        return;
      }
      ipcRenderer.send('connect-ssh', ip)
    },

    connectRemotely: (ip: any) => {
      if(validateIPAddress(ip) !== ip) {
        return;
      }
      return ipcRenderer.send('connect-remotely', ip)
    },

    getVars: async () => ipcRenderer.invoke('get-vars'),

    saveSwitchList: async (switchList: any[]) => {
      const val = validateSwitchList(switchList);
      if(!_.isEqual(val, switchList)) {
        return;
      }
      return ipcRenderer.invoke('save-switch-list', switchList)
    },

    loadSwitchList: async () => ipcRenderer.invoke('load-switch-list'),

    appendNotification: async (notification: MyNotification) => {
      if(validateNotification(notification) !== notification){
        return;
      }
      return ipcRenderer.invoke('append-notification', notification)
    },

    readNotifications: async () => ipcRenderer.invoke('read-notifications'),

    pingAllDevices: (callback: () => void) => {
      const listener = (_event: Electron.IpcRendererEvent) => callback();
      ipcRenderer.on('ping-all-devices', listener);

      // Return the cleanup function
      return () => {
        ipcRenderer.removeListener('ping-all-devices', listener);
      };
    },

    syncToServer: (callback: () => void) => ipcRenderer.on('sync-to-server', (_event) => callback()),

    showNotification: async (title: string, body: string) =>
      ipcRenderer.invoke('show-notification', title, body),
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
