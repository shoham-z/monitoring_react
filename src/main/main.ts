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
import { exec, spawn } from 'child_process';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

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

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

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
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  // Handle window close event (hide instead of quitting)
  mainWindow.on('close', (event) => {
    event.preventDefault(); // Prevent default quit behavior
    mainWindow?.hide(); // Hide the window instead
  });

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
    // for dev build
    // eslint-disable-next-line prettier/prettier
    const iconPath = path.join(__dirname, '../../assets/icons/golden_apple.png',);

    // for prod build
    // eslint-disable-next-line prettier/prettier
    // const iconPath = path.join(process.resourcesPath, 'assets/icons/golden_apple.png');

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
    tray.setToolTip('Fuck Me Mommy');
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

function parsePingResponge(output: string) {
  console.log(output);

  // Check for the presence of error messages (e.g., "Destination host unreachable")
  if (output.includes('Destination host unreachable')) {
    return false;
  }

  const statsRegex =
    /Packets: Sent = (\d+), Received = (\d+), Lost = (\d+) \((\d+)% loss\)/;
  const statsMatch = output.match(statsRegex);
  if (statsMatch) {
    return parseInt(statsMatch[1], 10) === parseInt(statsMatch[2], 10);
  }
  return { error: 'Invalid ping output format' };
}

// Listen for ping request from React frontend
ipcMain.on('ping-request', (event, host, count) => {
  exec(`ping -n ${count} ${host}`, (error, stdout, stderr) => {
    const success = parsePingResponge(stdout);
    const result = {
      success,
      ip: host,
    };
    if (error) {
      event.reply('ping-response', `Error: ${stderr}`);
    } else {
      event.reply('ping-response', result);
    }
  });
});

/// ========= END OF SECTION PING =========

/// ========= START OF SECTION CONNECT REMOTELY =========

function connectSSH(command: string) {
  spawn('cmd.exe', ['/k', command], {
    shell: true,
    detached: true,
    stdio: 'inherit', // Ensures it opens the window
  });
}

function runConsoleApp() {
  // Path to your console application
  const exePath = 'C:\\path\\to\\your\\app.exe';

  // Spawn the process
  const child = spawn(exePath, [], { shell: true });

  // Capture output
  child.stdout.on('data', (data) => {
    console.log(`Output: ${data}`);
  });

  child.stderr.on('data', (data) => {
    console.error(`Error: ${data}`);
  });

  child.on('close', (code) => {
    console.log(`Process exited with code ${code}`);
  });

  // Send input to the application (if needed)
  setTimeout(() => {
    child.stdin.write('Your input here\n'); // Send input to the application
  }, 1000);

  // Close input stream after some time (if needed)
  setTimeout(() => {
    child.stdin.end();
  }, 3000);
}

ipcMain.on('connect-remotely', (event, ip) => {
  console.log(`connecting to ${ip}`);
  connectSSH(`ssh root@${ip}`);
  // runConsoleApp();
});

/// ========= END OF SECTION CONNECT REMOTELY =========
