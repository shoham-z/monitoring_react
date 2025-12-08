import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import _ from 'lodash';
import { MyNotification } from './util';
import {
  validateIPAddress,
  validateNotification,
  validateNotificationParams,
  validateNotificationsResponse,
  validateSwitchList,
  validateSwitchListResponse,
  validateVarsResponse,
} from './validation';
import { PingableEntry } from '../renderer/utils';

interface APIResponse<T> {
  success: boolean;
  content?: T;
  error?: string;
}

const electronHandler = {
  ipcRenderer: {
    sendPing: async (ip: string) => {
      if (validateIPAddress(ip) !== ip) {
        return;
      }
      return ipcRenderer.invoke('ping-request', ip);
    },

    sendPingVisible: async (ip: string) => {
      if (validateIPAddress(ip) !== ip) {
        return;
      }
      ipcRenderer.send('ping-request-visible', ip);
    },

    connectSSH: (ip: string) => {
      if (validateIPAddress(ip) !== ip) {
        return;
      }
      ipcRenderer.send('connect-ssh', ip);
    },

    connectRemotely: (ip: string) => {
      if (validateIPAddress(ip) !== ip) {
        return;
      }
      return ipcRenderer.send('connect-remotely', ip);
    },

    getVars: async (): Promise<APIResponse<any>> => {
      try {
        const response = await ipcRenderer.invoke('get-vars');
        const validatedData = validateVarsResponse(response.content);
        return {
          success: true,
          content: validatedData,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },

    saveSwitchList: async (switchList: PingableEntry[]) => {
      if (!_.isEqual(validateSwitchList(switchList), switchList)) {
        return;
      }
      return ipcRenderer.invoke('save-switch-list', switchList);
    },

    loadSwitchList: async () => {
      const response = await ipcRenderer.invoke('load-switch-list');
      return validateSwitchListResponse(response);
    },

    appendNotification: async (notification: MyNotification) => {
      if (validateNotification(notification) !== notification) {
        return;
      }
      return ipcRenderer.invoke('append-notification', notification);
    },

    readNotifications: async () => {
      try {
        const response = await ipcRenderer.invoke('read-notifications');
        const validatedData = validateNotificationsResponse(response.content);
        return {
          success: true,
          content: validatedData,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },

    pingAllDevices: (callback: () => void) => {
      const listener = (_event: Electron.IpcRendererEvent) => callback();
      ipcRenderer.on('ping-all-devices', listener);

      // Return the cleanup function
      return () => {
        ipcRenderer.removeListener('ping-all-devices', listener);
      };
    },

    syncToServer: (callback: () => void) =>
      ipcRenderer.on('sync-to-server', (_event) => callback()),

    showNotification: async (title: string, body: string) => {
      validateNotificationParams({ title, body });
      return ipcRenderer.invoke('show-notification', title, body);
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
