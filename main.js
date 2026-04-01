const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { promisify } = require('util');

const exec = promisify(require('child_process').exec);

let mainWindow;

function createWindow() {
 mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  mainWindow.loadFile('index.html');
  // mainWindow.webContents.openDevTools(); // descomente para debug
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// Controles da janela
ipcMain.on('window-close', () => app.quit());
ipcMain.on('window-minimize', () => mainWindow.minimize());
ipcMain.on('window-maximize', () => {
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function findPython() {
  const commands = ['python3', 'python', 'py'];
  for (const cmd of commands) {
    try {
      const { stdout, stderr } = await exec(`${cmd} --version`);
      const output = (stdout + stderr).toLowerCase();
      if (output.includes('python')) return cmd;
    } catch (e) {}
  }
  const commonPaths = [
    // Windows
    'C:\\Python314\\python.exe', 'C:\\Python313\\python.exe', 'C:\\Python312\\python.exe',
    'C:\\Python311\\python.exe', 'C:\\Python310\\python.exe', 'C:\\Python39\\python.exe',
    `${process.env.LOCALAPPDATA}\\Programs\\Python\\Python314\\python.exe`,
    `${process.env.LOCALAPPDATA}\\Programs\\Python\\Python313\\python.exe`,
    `${process.env.LOCALAPPDATA}\\Programs\\Python\\Python312\\python.exe`,
    `${process.env.USERPROFILE}\\AppData\\Local\\Microsoft\\WindowsApps\\python.exe`,
    // Linux
    '/usr/bin/python3',
    '/usr/local/bin/python3',
    '/usr/bin/python',
    '/usr/local/bin/python',
    // macOS (Homebrew)
    '/opt/homebrew/bin/python3',
    '/usr/local/opt/python3/bin/python3',
  ];
  for (const p of commonPaths) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

ipcMain.handle('select-pac-file', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Arquivos PAC', extensions: ['pac'] }, { name: 'Todos os arquivos', extensions: ['*'] }],
    title: 'Selecionar arquivo PAC'
  });
  if (result.canceled || !result.filePaths[0]) return null;
  const pacPath = result.filePaths[0];
  const stats = fs.statSync(pacPath);
  return {
    success: true,
    path: pacPath,
    name: path.basename(pacPath),
    size: stats.size,
    sizeFormatted: formatFileSize(stats.size)
  };
});

ipcMain.handle('extract-pac', async (event, pacPath) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!fs.existsSync(pacPath)) throw new Error('Arquivo PAC não encontrado');
      const pythonCmd = await findPython();
      if (!pythonCmd) throw new Error(
        'Python não encontrado!\n' +
        'Windows: Instale o Python 3.14 em python.org e marque "Add Python to PATH".\n' +
        'Linux: Execute "sudo apt install python3" no terminal.'
      );
      event.sender.send('extract-log', `✅ Python detectado: ${pythonCmd}`);

      let scriptPath;
      if (app.isPackaged) {
        scriptPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'extractor.py');
      } else {
        scriptPath = path.join(__dirname, 'extractor.py');
      }
      if (!fs.existsSync(scriptPath)) throw new Error('Script extractor.py não encontrado em: ' + scriptPath);

      const outputDir = path.join(path.dirname(pacPath), 'extracted_' + path.basename(pacPath, '.pac'));
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

      event.sender.send('extract-progress', { percent: 0, message: 'Iniciando extração...' });

      const pythonProcess = spawn(pythonCmd, [scriptPath, pacPath, outputDir], {
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
      });

      let outputBuffer = '';
      pythonProcess.stdout.on('data', (data) => {
        const text = data.toString();
        outputBuffer += text;
        text.split('\n').forEach(line => {
          if (line.trim()) {
            event.sender.send('extract-log', line.trim());
            const percentMatch = line.match(/(\d+)%/);
            if (percentMatch) {
              const percent = parseInt(percentMatch[1]);
              event.sender.send('extract-progress', { percent: Math.min(percent, 99), message: line.trim() });
            }
          }
        });
      });
      pythonProcess.stderr.on('data', (data) => {
        event.sender.send('extract-log', `⚠️ ${data.toString().trim()}`);
      });
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          event.sender.send('extract-progress', { percent: 100, message: 'Extração concluída!' });
          let files = fs.readdirSync(outputDir);
          resolve({ success: true, outputDir, files, message: `Extraído! ${files.length} arquivos.` });
        } else {
          reject(new Error(`Extrator falhou com código ${code}\n${outputBuffer}`));
        }
      });
      pythonProcess.on('error', (err) => reject(new Error(`Erro ao executar Python: ${err.message}`)));
    } catch (err) {
      reject(err);
    }
  });
});

console.log('✅ Main process (apenas extração) iniciado');