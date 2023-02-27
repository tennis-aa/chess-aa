const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronInterface', {
  uciCmd: (cmd) => ipcRenderer.send('uci-cmd', cmd),
  engineLaunch: () => ipcRenderer.send('engine-launch'),
  engineOnMessage: (callback) => ipcRenderer.on('engine-message', callback),
  engineOnSwitch: (callback) => ipcRenderer.on('engine-switch', callback)
})