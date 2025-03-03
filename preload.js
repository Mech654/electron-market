const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  send: (channel, data) => ipcRenderer.send(channel, data),
  receive: (channel, callback) => ipcRenderer.on(channel, (_, ...args) => callback(...args)),
  profile: () => ipcRenderer.invoke("profile"),
  market: () => ipcRenderer.invoke("market"),
});
