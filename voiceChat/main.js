// main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // set true if using preload
    },
  });

  // Load Angular app
  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, 'dist', 'voice-chat', 'index.html'));
  } else {
    win.loadURL('http://localhost:4200');
  }
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});