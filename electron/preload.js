const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('engineAPI', {
  uciCmd: (cmd) => ipcRenderer.send('uci-cmd', cmd),
  engineLaunch: () => ipcRenderer.send('engine-launch'),
  engineTerminate: () => ipcRenderer.send('engine-terminate'),
  engineOnMessage: (callback) => ipcRenderer.on('engine-message', callback),
  engineOnSwitch: (callback) => ipcRenderer.on('engine-switch', callback)
});