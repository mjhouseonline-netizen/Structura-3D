const { app, BrowserWindow, session, dialog, Menu } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

// The Windows portable launcher supplies its original location (not its temp extraction path).
const besideApp = process.platform === 'darwin'
  ? path.resolve(process.execPath, '../../../..') : path.dirname(process.execPath);
const portableRoot = process.env.PORTABLE_EXECUTABLE_DIR ||
  (fs.existsSync(path.join(besideApp, 'Structura-Portable.txt')) ? besideApp : null);
try {
  if (portableRoot) {
    const profile = path.join(portableRoot, 'Structura Data', process.platform);
    fs.mkdirSync(profile, { recursive: true });
    fs.accessSync(profile, fs.constants.W_OK);
    app.setPath('userData', profile);
    app.setPath('sessionData', profile);
  }
} catch (error) {
  dialog.showErrorBox('Cannot save to this drive', 'Copy Structura to a writable drive before opening it.\n' + error.message);
  app.exit(1);
}

app.commandLine.appendSwitch('disable-background-networking');
let mainWindow;
async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440, height: 940, minWidth: 900, minHeight: 640,
    title: 'Structura 3D — Offline', backgroundColor: '#020617',
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true },
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', event => event.preventDefault());
  await mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
}

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { if (mainWindow) { mainWindow.restore(); mainWindow.focus(); } });
  app.whenReady().then(async () => {
    // No server, CDN, API key, login, updater, or external network requests.
    session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
      callback({ cancel: !/^(file|data|blob|devtools):/.test(details.url) });
    });
    session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
    session.defaultSession.on('will-download', (_event, item) => {
      item.setSaveDialogOptions({
        title: 'Save Structura file',
        defaultPath: path.join(portableRoot || app.getPath('documents'), path.basename(item.getFilename())),
      });
    });
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      ...(process.platform === 'darwin' ? [{ role: 'appMenu' }] : []),
      { label: 'File', submenu: [{ role: 'close' }, { role: 'quit' }] },
      { role: 'editMenu' },
      { label: 'View', submenu: [{ role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { role: 'togglefullscreen' }] },
    ]));
    await createWindow();
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  }).catch(error => { dialog.showErrorBox('Structura could not start', error.message); app.quit(); });
}
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
