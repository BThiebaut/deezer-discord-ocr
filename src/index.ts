import { app, BrowserWindow, globalShortcut } from 'electron'
import { overlayWindow } from 'electron-overlay-window'
import * as path from 'path';
import fs = require('fs');
import { Ocr } from './Ocr'
const ipc = require('electron').ipcMain;
const TMP_PATH = path.join(__dirname, '../src/png/tmp.png');
app.commandLine.appendSwitch('ignore-certificate-errors')

// https://github.com/electron/electron/issues/25153
app.disableHardwareAcceleration()

let window: BrowserWindow
var ignoreMouseEvent = true;
var registered = false;
let OcrInstance : Ocr;

function createWindow () {
  window = new BrowserWindow({
    width: 400,
    height: 300,
    webPreferences: {
      nodeIntegration: true,
      webSecurity : false
    },
    ...overlayWindow.WINDOW_OPTS
  })

  window.loadFile(path.join(__dirname, '../src/views/overlay.html'));

  // NOTE: if you close Dev Tools overlay window will lose transparency 
  window.webContents.openDevTools({ mode: 'detach', activate: false })

  window.setIgnoreMouseEvents(ignoreMouseEvent)

  registerHooks()

  overlayWindow.attachTo(window, 'Deezer')
  
  window.webContents.once('dom-ready', () => {
    OcrInstance = new Ocr();
  })

  ipc.on('process-ocr', (e, png) => {
    fs.writeFileSync(path.join(__dirname, '../src/png/tmp.png'), png);
    OcrInstance.readPng(TMP_PATH);
  });
  
}

function exitOverlay(){
  app.quit(); 
}

function registerHooks () {

  if (!registered){
    globalShortcut.register('Shift + Plus', exitOverlay);
    registered = true;
  }
}

app.on('ready', createWindow)

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

overlayWindow.on('detach', () => {
  app.quit();
});

overlayWindow.on('blur', () => {
  globalShortcut.unregisterAll();
  registered = false;
});

overlayWindow.on('focus', () => {
  registerHooks();
});