const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let expressServer = null;
const PORT = 3000;

// Set user data directory to Windows AppData (%APPDATA%/InvoiceWise/Data)
const appDataPath = path.join(app.getPath('userData'), 'InvoiceWiseData');
process.env.INVOICEWISE_DATA_DIR = appDataPath;

function startExpressServer() {
  try {
    // Require and start Express server from server.js
    expressServer = require('./server.js');
  } catch (err) {
    console.error('Failed to start embedded server:', err);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 920,
    minHeight: 640,
    title: 'InvoiceWise — Professional GST Billing',
    icon: path.join(__dirname, 'public', 'logo.png'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    }
  });

  // Load backend URL
  mainWindow.loadURL(`http://localhost:${PORT}`);

  // Handle pop-ups (e.g., A4 Invoice Print Pop-up) cleanly within Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    return {
      action: 'allow',
      overrideBrowserWindowOptions: {
        width: 900,
        height: 950,
        title: 'InvoiceWise — Tax Invoice Print',
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      }
    };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    startExpressServer();

    // Give Express a brief moment to listen before opening window
    setTimeout(() => {
      createWindow();
    }, 400);

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
