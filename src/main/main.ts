/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  Menu,
  Tray,
  nativeImage,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { spawn, execFile } from 'child_process';
import ping from 'ping';
import fs from 'fs';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

const basePath = app.isPackaged
  ? process.resourcesPath // for production
  : path.join(__dirname, '../..'); // for development

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = path.join(basePath, 'assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1600,
    height: 900,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../', '.erb/dll/preload.js'),
    },
  });

  // Handle window close event (hide instead of quitting)
  mainWindow.on('close', (event) => {
    event.preventDefault(); // Prevent default quit behavior
    mainWindow?.hide(); // Hide the window instead
  });

  mainWindow.webContents.openDevTools();

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    const iconPath = path.join(basePath, 'assets/icons/golden_apple.png');

    const icon = nativeImage.createFromPath(iconPath);

    const tray = new Tray(icon);
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Ping All Switches',
        click: () => {
          console.log('Pinging');
        },
      },
      {
        label: 'Sync to Server',
        click: () => {
          console.log('Syncing');
        },
      },
      {
        label: 'Show Window',
        click: () => {
          mainWindow?.show();
        },
      },
      {
        label: 'Quit',
        click: () => {
          mainWindow?.destroy();
          app.quit();
        },
      },
    ]);
    tray.setToolTip('Golden Apple');
    tray.setContextMenu(contextMenu);
    tray.on('click', () => mainWindow?.show());

    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

/// ========= START OF SECTION PING =========
ipcMain.handle('ping-request', async (_event, host) => {
  try {
    const result = await ping.promise.probe(host);
    return { ip: result.host, success: result.alive }; // returned directly to renderer
  } catch (err: any) {
    return { alive: false, error: err.message };
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

ipcMain.handle('get-vars', async (_event) => {
  try {
    const filePath = path.join(basePath, 'assets/vars.txt');
    const json = fs.readFileSync(filePath, 'utf-8');
    const content = JSON.parse(json);
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

