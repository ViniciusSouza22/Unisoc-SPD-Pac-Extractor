// renderer.js - Unisoc SPD Pac Extractor (apenas extração)
console.log('renderer.js carregado');

const { ipcRenderer } = require('electron');

let currentPACFile = null;
let lastLogMessage = '';
let logCount = 0;
let lastProgressTime = 0;

// Elementos DOM
const selectPacBtn = document.getElementById('selectPacBtn');
const extractBtn = document.getElementById('extractBtn');
const clearLogsBtn = document.getElementById('clearLogsBtn');
const pacPathDiv = document.getElementById('pacPath');
const pacInfoDiv = document.getElementById('pacInfo');
const fileListContainer = document.getElementById('fileListContainer');
const logArea = document.getElementById('logArea');
const extractProgressFill = document.getElementById('extractProgressFill');
const extractProgressText = document.getElementById('extractProgressText');
const extractStatus = document.getElementById('extractStatus');
const globalStatus = document.getElementById('globalStatus');

// Controles da janela
document.getElementById('closeBtn')?.addEventListener('click', () => ipcRenderer.send('window-close'));
document.getElementById('minimizeBtn')?.addEventListener('click', () => ipcRenderer.send('window-minimize'));
document.getElementById('maximizeBtn')?.addEventListener('click', () => ipcRenderer.send('window-maximize'));

// ===================== FUNÇÕES AUXILIARES =====================
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'})[m]);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function cleanPythonSpam(msg) {
    if (!msg) return '';
    const percentCount = (msg.match(/%/g) || []).length;
    if (percentCount >= 3) {
        const first = msg.match(/\d+%/)?.[0] || 'Progresso';
        return `${first} (progresso)`;
    }
    return msg.replace(/(\b\d+%\b)(?:\s*\1)+/g, '$1 (progresso)');
}

function truncate(msg) {
    return msg.length > 280 ? msg.substring(0, 280) + '…' : msg;
}

// ===================== FUNÇÃO DE LOG =====================
function addLog(message, type = 'info') {
    if (!logArea) return;
    
    let clean = message.toString().trim();
    clean = truncate(clean);
    clean = cleanPythonSpam(clean);
    if (!clean) return;

    const isProgress = clean.includes('% (progresso)') || clean.includes('Progresso');
    if (isProgress) {
        if (Date.now() - lastProgressTime < 250) return;
        lastProgressTime = Date.now();
    }

    if (clean === lastLogMessage) return;
    lastLogMessage = clean;

    if (logCount >= 200 && logArea.firstChild) {
        logArea.removeChild(logArea.firstChild);
    } else logCount++;

    const div = document.createElement('div');
    div.className = `log-entry ${type}`;
    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    div.innerHTML = `<span class="log-time">[${time}]</span><span class="log-message">${escapeHtml(clean)}</span>`;
    logArea.appendChild(div);
    div.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

// ===================== ATUALIZAR PROGRESSO =====================
function updateProgress(percent, statusText = null) {
    const p = Math.min(100, Math.max(0, percent));
    if (extractProgressFill) extractProgressFill.style.width = `${p}%`;
    if (extractProgressText) extractProgressText.textContent = `${p}%`;
    if (statusText) {
        if (extractStatus) extractStatus.innerHTML = `<i class="fas fa-circle-info"></i><span>${escapeHtml(statusText)}</span>`;
        if (globalStatus) globalStatus.textContent = statusText;
    }
}

// ===================== NOTIFICAÇÃO =====================
function showNotification(msg, type = 'info') {
    const n = document.getElementById('notification');
    if (!n) return;
    n.textContent = msg;
    n.className = `notification ${type} show`;
    setTimeout(() => n.classList.remove('show'), 3000);
}

// ===================== RECEBER LOGS DO PROCESSO PRINCIPAL =====================
ipcRenderer.on('extract-log', (event, message) => {
    let clean = message.replace(/[\x00-\x1F\x7F]/g, '').trim();
    if (clean) {
        clean.split(/\r?\n/).forEach(line => {
            if (line.trim()) addLog(line.trim(), 'info');
        });
    }
});

ipcRenderer.on('extract-progress', (event, data) => {
    if (data.percent !== undefined) updateProgress(data.percent, data.status || 'Processando...');
    if (data.message) addLog(data.message, 'info');
});

// ===================== SELECIONAR PAC =====================
selectPacBtn.addEventListener('click', async () => {
    try {
        addLog('📂 Abrindo seletor de arquivo...', 'info');
        const result = await ipcRenderer.invoke('select-pac-file');
        if (!result) {
            addLog('Nenhum arquivo selecionado', 'warning');
            return;
        }

        currentPACFile = result;
        if (pacPathDiv) pacPathDiv.innerHTML = `<i class="fas fa-file"></i><span>${escapeHtml(result.path)}</span>`;
        if (pacInfoDiv) {
            pacInfoDiv.style.display = 'flex';
            pacInfoDiv.innerHTML = `<i class="fas fa-database"></i><span><strong>${escapeHtml(result.name)}</strong> (${result.sizeFormatted})</span>`;
        }
        if (fileListContainer) {
            fileListContainer.innerHTML = `
                <div class="file-item"><i class="fas fa-microchip"></i><span>PAC da Unisoc/Spreadtrum</span></div>
                <div class="file-item"><i class="fas fa-archive"></i><span>Aguardando extração...</span></div>
            `;
        }
        extractBtn.disabled = false;
        addLog(`✅ Arquivo selecionado: ${result.name} (${result.sizeFormatted})`, 'success');
        showNotification('Arquivo PAC selecionado!', 'success');
    } catch (err) {
        console.error('Erro:', err);
        addLog(`❌ Erro: ${err.message}`, 'error');
        showNotification('Erro ao selecionar arquivo', 'error');
    }
});

// ===================== EXTRAIR =====================
extractBtn.addEventListener('click', async () => {
    if (!currentPACFile) {
        addLog('❌ Nenhum arquivo PAC selecionado', 'error');
        return;
    }

    try {
        extractBtn.disabled = true;
        const originalHtml = extractBtn.innerHTML;
        extractBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i><span>Extraindo...</span>';
        addLog('🚀 Iniciando extração...', 'info');
        addLog('⏳ Aguarde, pode levar alguns minutos...', 'info');
        updateProgress(0, 'Iniciando extração...');

        const result = await ipcRenderer.invoke('extract-pac', currentPACFile.path);

        if (result.success) {
            addLog(`✅ ${result.message}`, 'success');
            addLog(`📁 Pasta: ${result.outputDir}`, 'success');
            if (result.files && result.files.length) {
                if (fileListContainer) {
                    fileListContainer.innerHTML = result.files.map(f => `<div class="file-item"><i class="fas fa-file"></i><span>${escapeHtml(f)}</span></div>`).join('');
                }
                addLog(`📦 ${result.files.length} arquivos extraídos`, 'success');
            }
            updateProgress(100, 'Extração concluída!');
            showNotification('Extração concluída com sucesso!', 'success');
        } else {
            throw new Error(result.error || 'Erro desconhecido');
        }
    } catch (err) {
        console.error('Erro na extração:', err);
        addLog(`❌ ${err.message}`, 'error');
        updateProgress(0, 'Erro na extração');
        showNotification('Erro na extração', 'error');
    } finally {
        extractBtn.disabled = false;
        extractBtn.innerHTML = '<i class="fas fa-file-export"></i><span>Extrair PAC</span>';
    }
});

// ===================== LIMPAR LOGS =====================
clearLogsBtn.addEventListener('click', () => {
    if (logArea) {
        logArea.innerHTML = `<div class="log-entry info"><span class="log-time">[--:--:--]</span><span class="log-message">🧹 Logs limpos</span></div>`;
        logCount = 0;
        lastLogMessage = '';
        lastProgressTime = 0;
        addLog('Logs limpos', 'info');
        showNotification('Logs limpos', 'info');
    }
});

// Inicialização
addLog('🎉 Unisoc SPD Pac Extractor pronto!', 'success');
addLog('📌 Selecione um arquivo .PAC para começar', 'info');
updateProgress(0, 'Pronto');