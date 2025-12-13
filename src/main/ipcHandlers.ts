import path from 'path';
import { spawn, execFile } from 'child_process';
import ping from 'ping';
import fs from 'fs';
import { ipcMain, Notification } from 'electron';
import { basePath } from './main';


/// ========= START OF SECTION PING =========
ipcMain.handle('ping-request', async (_event, host) => {
  try {
    const result = await ping.promise.probe(host);
    return { success: result.alive, content: result.host }; // returned directly to renderer
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.on('ping-request-visible', async (_event, host) => {
  // 1st cmd  : /c   → run a command and exit
  // start "" : open a *new* window; "Ping" is the window title
  // 2nd cmd  : /k   → keep that new window open after ping

  const child = spawn(
    'cmd.exe',
    ['/c', 'start', '"Ping"', 'cmd', '/k', `ping ${host}`],
    {
      windowsHide: false, // show the console
      detached: true, // independent from Electron’s process
    },
  );

  child.unref(); // let Electron quit without killing the console});
});
/// ========= END OF SECTION PING =========

/// ========= START OF SECTION CONNECT REMOTELY =========
ipcMain.on('connect-ssh', (event, ip) => {
  console.log(`connecting ssh to ${ip}`);

  const puttyPath = path.join(basePath, 'assets', 'putty.exe');

  execFile(puttyPath, ['-ssh', ip], (error: any) => {
    if (error) {
      console.error('Failed to start PuTTY:', error);
    }
  });
});

ipcMain.on('connect-remotely', (event, ip) => {
  console.log(`connecting to ${ip}`);

  // Launch it in a new console window
  spawn('cmd.exe', ['/c', 'start', '', 'C:\\RemoteCliClient_2_Windows.exe'], {
    detached: true,
    stdio: 'ignore', // Important: don't tie input/output to Electron
  });
});
/// ========= END OF SECTION CONNECT REMOTELY =========

/// ========= START OF SECTION LOAD/SAVE LOCAL DATA =========
ipcMain.handle('get-vars', async (_event) => {
  try {
    const filePath = path.join(basePath, 'assets/vars.json');
    const json = fs.readFileSync(filePath, 'utf-8');
    const content = JSON.parse(json);
    return { success: true, content };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('save-switch-list', async (_event, switchList) => {
  try {
    const filePath = path.join(basePath, 'assets/switches.json');
    const json = JSON.stringify(switchList, null, 2);
    fs.writeFileSync(filePath, json, 'utf-8');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-switch-list', async (_event) => {
  try {
    const filePath = path.join(basePath, 'assets/switches.json');
    if (!fs.existsSync(filePath)) {
      return { success: true, content: [] };
    }
    const json = fs.readFileSync(filePath, 'utf-8');
    const content = JSON.parse(json);
    return { success: true, content };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

function readNotificationsFromFile(): Notification[] {
  try {
    const filePath = path.join(basePath, 'assets/notifications.json');
    const json = fs.readFileSync(filePath, 'utf-8');
    const content = JSON.parse(json) as Notification[];
    return content;
  }
  catch(e: any) {
    if(e.name === "SyntaxError") {
      // handle invalid format/empty file
    }
    if (e.code === "ENOENT") {
      // handle nonexistent file
    }
    // error #1: e.name === SyntaxError - json format invalid - either someone messed with the file/file empty
    // error #2: e.code === ENOENT - file not found
    return [];
  }
}

ipcMain.handle('append-notification', async (_event, notification) => {
  try {
    const notifications = readNotificationsFromFile();
    notifications.unshift(notification);
    const filePath = path.join(basePath, 'assets/notifications.json');
    const json = JSON.stringify(notifications, null, 2);
    fs.writeFileSync(filePath, json, 'utf-8');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('read-notifications', async (_event) => {
  try {
    const content = readNotificationsFromFile();
    return { success: true, content };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});
/// ========= END OF SECTION LOAD/SAVE LOCAL DATA =========

ipcMain.handle('show-notification', async (_event, title, body) => {
  try {
    const notification = new Notification({ title, body });
    notification.show();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});
