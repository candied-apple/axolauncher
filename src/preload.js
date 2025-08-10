const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  close: () => ipcRenderer.send('window-close'),
  launchMinecraft: (opts) => ipcRenderer.send('launch-minecraft', opts),
  onLauncherVersion: (callback) => ipcRenderer.on('launcher-version', (event, version) => callback(version)),
  onGameLog: (callback) => ipcRenderer.on('game-log', (event, line) => callback(line)),
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (event, info) => callback(info)),
  onToast: (callback) => ipcRenderer.on('toast', (event, data) => callback(data)),
});
