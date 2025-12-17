import { contextBridge, ipcRenderer } from 'electron';
import { MyNotification } from './util';
import {
  PingResponse,
  validateIPAddress,
  validateNotification,
  validateNotificationParams,
  validateNotificationsResponse,
  ValidatePingResponse,
  validateItemList,
  validateItemListResponse,
  validateVarsResponse,
  VarsResponseSchema,
} from './validation';
import z from 'zod';
import { PingableEntry } from '../renderer/utils';

export function isArraysEqual(array1: PingableEntry[], array2: PingableEntry[]) {
  return JSON.stringify(array1) === JSON.stringify(array2);
}

const electronHandler = {
  ipcRenderer: {
    sendPing: async (ip: string): Promise<PingResponse> => {
      if (validateIPAddress(ip) !== ip) {
        return {
          success: false,
          error: 'Invalid IP address',
        };
      }
      const response = await ipcRenderer.invoke('ping-request', ip);

      return ValidatePingResponse(response);
    },

    sendPingVisible: (ip: string) : void => {
      if (validateIPAddress(ip) !== ip) {
        return;
      }
      ipcRenderer.send('ping-request-visible', ip);
    },

    connectSSH: (ip: string) : void => {
      if (validateIPAddress(ip) !== ip) {
        return;
      }
      ipcRenderer.send('connect-ssh', ip);
    },

    connectRemotely: (ip: string) : void => {
      if (validateIPAddress(ip) !== ip) {
        return;
      }
      return ipcRenderer.send('connect-remotely', ip);
    },

    getVars: async (): Promise<z.infer<typeof VarsResponseSchema>> => {
      const response = await ipcRenderer.invoke('get-vars');

      return validateVarsResponse(response);
    },

    saveItemList: async (itemList: PingableEntry[]) => {
      if (!isArraysEqual(validateItemList(itemList), itemList)) {
        return;
      }
      return ipcRenderer.invoke('save-item-list', itemList);
    },

    loadItemList: async () => {
      try {
      const response = await ipcRenderer.invoke('load-item-list');
      const validatedData = validateItemListResponse(response.content);
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
