// preload.js
const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload carregado');

contextBridge.exposeInMainWorld('electronAPI', {
    // Controles da janela
    closeWindow: () => ipcRenderer.send('window-close'),
    minimizeWindow: () => ipcRenderer.send('window-minimize'),
    maximizeWindow: () => ipcRenderer.send('window-maximize'),
    
    // Extração
    selectPACFile: () => ipcRenderer.invoke('select-pac-file'),
    extractPAC: (pacPath) => ipcRenderer.invoke('extract-pac', pacPath),
    
    // Empacotamento
    selectFolder: () => ipcRenderer.invoke('select-folder'),
    countFilesInFolder: (folderPath) => ipcRenderer.invoke('count-files-in-folder', folderPath),
    repackPAC: (options) => ipcRenderer.invoke('repack-pac', options),
    
    // Logs e progresso
    onLog: (callback) => ipcRenderer.on('extract-log', (event, msg) => callback(msg)),
    onProgress: (callback) => ipcRenderer.on('extract-progress', (event, data) => callback(data))
});