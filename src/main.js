

// Enable auto-updates via update-electron-app (see https://github.com/electron/update-electron-app)
const { updateElectronApp } = require('update-electron-app');
updateElectronApp(); // additional configuration options available

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const { version: LAUNCHER_VERSION } = require('../package.json');

const createWindow = () => {
    // Use native title bar on macOS, custom on others
    const isMac = process.platform === 'darwin';
    const mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        frame: isMac ? true : false,
        titleBarStyle: isMac ? 'default' : 'hidden',
        icon: "./assets/icon.png",
        webPreferences: {
            preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    // Expose launcher version to renderer
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('launcher-version', LAUNCHER_VERSION);
    });

  // IPC handlers for custom window controls
  ipcMain.on('window-minimize', () => {
    mainWindow.minimize();
  });
  ipcMain.on('window-close', () => {
    mainWindow.close();
  });


    // mainWindow.webContents.openDevTools(); // Disabled for production
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


// --- axocore backend integration ---
const axocore = require('axocore');
const https = require('https');
const fs = require('fs');
const crypto = require('crypto');
let minecraftProcess = null;

// Helper function to download a file
function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, (unlinkErr) => {
                if (unlinkErr) {
                    console.error(`Failed to delete file: ${unlinkErr}`);
                }
            });
            reject(err);
        });
    });
}

// Update files before launching Minecraft
async function updateFiles(win) {
    return new Promise((resolve, reject) => {
        const filesUrl = 'https://vds.candiedapple.me/files.json';
        const whitelistUrl = 'https://vds.candiedapple.me/whitelisted_files.json';
        const minecraftPath = path.resolve(process.env.APPDATA || process.env.HOME, '.axocraft');

        let filesToKeep = new Set();
        let directoriesToKeep = new Set();
        let prefixesToKeep = [];

        // Fetch and parse whitelist
        https.get(whitelistUrl, (response) => {
            let whitelistData = '';
            response.on('data', chunk => {
                whitelistData += chunk;
            });
            response.on('end', () => {
                try {
                    const whitelist = JSON.parse(whitelistData);
                    whitelist.files.forEach(file => filesToKeep.add(file));
                    whitelist.directories.forEach(dir => directoriesToKeep.add(path.normalize(dir)));
                    if (whitelist.prefixes) {
                        prefixesToKeep = whitelist.prefixes.map(prefix => prefix.toLowerCase());
                    }
                    // Fetch and parse files list
                    https.get(filesUrl, (response) => {
                        let data = '';
                        response.on('data', chunk => {
                            data += chunk;
                        });
                        response.on('end', () => {
                            try {
                                const files = JSON.parse(data);
                                let totalFiles = files.length;
                                let processedFiles = 0;
                                files.forEach(file => filesToKeep.add(path.normalize(file.filename)));
                                // Calculate total size in bytes for all files
                                let totalBytes = files.reduce((sum, file) => sum + (file.size || 0), 0);
                                let cumulativeBytes = 0;
                                win && win.webContents.send('download-progress', {
                                    type: 'server-files',
                                    cumulativeBytes: 0,
                                    totalBytes: totalBytes,
                                    processedFiles: 0,
                                    totalFiles
                                });
                                files.forEach(file => {
                                    const filename = file.filename;
                                    const expectedHash = file.hash;
                                    const fileUrl = `https://vds.candiedapple.me/files/${filename}`;
                                    const fullPath = path.join(minecraftPath, filename);
                                    let fileExists = fs.existsSync(fullPath);
                                    let fileHash = '';
                                    if (fileExists) {
                                        fileHash = crypto.createHash('sha256').update(fs.readFileSync(fullPath)).digest('hex');
                                        if (fileHash === expectedHash) {
                                            win && win.webContents.send('game-log', `File ${filename} is up to date.`);
                                            processedFiles++;
                                            cumulativeBytes += file.size || 0;
                                            win && win.webContents.send('download-progress', {
                                                type: 'server-files',
                                                cumulativeBytes,
                                                totalBytes,
                                                processedFiles,
                                                totalFiles
                                            });
                                            checkProgress();
                                            return;
                                        } else {
                                            win && win.webContents.send('game-log', `File ${filename} has changed. Downloading the updated file...`);
                                        }
                                    } else {
                                        win && win.webContents.send('game-log', `File ${filename} does not exist. Downloading...`);
                                    }
                                    const directory = path.dirname(fullPath);
                                    try {
                                        if (!fs.existsSync(directory)) {
                                            fs.mkdirSync(directory, { recursive: true });
                                        }
                                    } catch (err) {
                                        win && win.webContents.send('game-log', `Failed to create directory ${directory}: ${err}`);
                                        processedFiles++;
                                        checkProgress();
                                        return;
                                    }
                                    downloadFile(fileUrl, fullPath).then(() => {
                                        const downloadedFileHash = crypto.createHash('sha256').update(fs.readFileSync(fullPath)).digest('hex');
                                        if (downloadedFileHash !== expectedHash) {
                                            win && win.webContents.send('game-log', `Hash mismatch after download for file ${filename}.`);
                                        } else {
                                            win && win.webContents.send('game-log', `File ${filename} downloaded successfully and is up to date.`);
                                        }
                                        processedFiles++;
                                        cumulativeBytes += file.size || 0;
                                        win && win.webContents.send('download-progress', {
                                            type: 'server-files',
                                            cumulativeBytes,
                                            totalBytes,
                                            processedFiles,
                                            totalFiles
                                        });
                                        checkProgress();
                                    }).catch(err => {
                                        win && win.webContents.send('game-log', `Failed to download ${filename}: ${err}`);
                                        processedFiles++;
                                        cumulativeBytes += file.size || 0;
                                        win && win.webContents.send('download-progress', {
                                            type: 'server-files',
                                            cumulativeBytes,
                                            totalBytes,
                                            processedFiles,
                                            totalFiles
                                        });
                                        checkProgress();
                                    });
                                });
                                function removeOldFiles() {
                                    function deleteDirectoryRecursively(dirPath) {
                                        fs.readdir(dirPath, (err, files) => {
                                            if (err) {
                                                win && win.webContents.send('game-log', `Failed to read directory ${dirPath}: ${err}`);
                                                return;
                                            }
                                            files.forEach(file => {
                                                const fullPath = path.join(dirPath, file);
                                                fs.stat(fullPath, (err, stats) => {
                                                    if (err) {
                                                        win && win.webContents.send('game-log', `Failed to get stats for ${fullPath}: ${err}`);
                                                        return;
                                                    }
                                                    if (stats.isDirectory()) {
                                                        deleteDirectoryRecursively(fullPath);
                                                    } else {
                                                        const relativeFilePath = path.relative(minecraftPath, fullPath);
                                                        const baseDir = relativeFilePath.split(path.sep)[0];
                                                        const fileName = path.basename(relativeFilePath);
                                                        if (
                                                            !filesToKeep.has(relativeFilePath) &&
                                                            !directoriesToKeep.has(baseDir) &&
                                                            !prefixesToKeep.some(prefix => fileName.toLowerCase().startsWith(prefix))
                                                        ) {
                                                            fs.unlink(fullPath, (err) => {
                                                                if (err) {
                                                                    win && win.webContents.send('game-log', `Failed to delete file ${fullPath}: ${err}`);
                                                                } else {
                                                                    win && win.webContents.send('game-log', `Deleted file ${fullPath}`);
                                                                }
                                                            });
                                                        }
                                                    }
                                                });
                                            });
                                            fs.readdir(dirPath, (err, remainingFiles) => {
                                                if (err) {
                                                    win && win.webContents.send('game-log', `Failed to read directory ${dirPath} after deletion: ${err}`);
                                                    return;
                                                }
                                                if (remainingFiles.length === 0 && !directoriesToKeep.has(path.relative(minecraftPath, dirPath)) && !prefixesToKeep.some(prefix => path.basename(dirPath).toLowerCase().startsWith(prefix))) {
                                                    fs.rmdir(dirPath, (err) => {
                                                        if (err) {
                                                            win && win.webContents.send('game-log', `Failed to delete directory ${dirPath}: ${err}`);
                                                        } else {
                                                            win && win.webContents.send('game-log', `Deleted directory ${dirPath}`);
                                                        }
                                                    });
                                                }
                                            });
                                        });
                                    }
                                    deleteDirectoryRecursively(minecraftPath);
                                    resolve(true);
                                }
                                function checkProgress() {
                                    win && win.webContents.send('progress', {
                                        total: totalFiles,
                                        task: processedFiles,
                                        type: 'server files'
                                    });
                                    if (processedFiles === totalFiles) {
                                        removeOldFiles();
                                    }
                                }
                            } catch (error) {
                                reject(`Failed to parse file list: ${error.message}`);
                            }
                        });
                    }).on('error', (err) => {
                        reject(`Failed to fetch file list: ${err.message}`);
                    });
                } catch (error) {
                    reject(`Failed to parse whitelist: ${error.message}`);
                }
            });
        }).on('error', (err) => {
            reject(`Failed to fetch whitelist: ${err.message}`);
        });
    });
}

// IPC handler to allow renderer to trigger updateFiles directly if needed
ipcMain.handle('update-files', async (event) => {
    const win = BrowserWindow.getFocusedWindow();
    return await updateFiles(win);
});

ipcMain.on('launch-minecraft', async (event, opts) => {
    // opts: { username, password, ram, minRam, javaArgs }
    const win = BrowserWindow.getFocusedWindow();
    if (minecraftProcess && !minecraftProcess.killed) {
        win && win.webContents.send('game-log', '[Launcher] Minecraft is already running.');
        win && win.webContents.send('game-status', { running: true });
        return;
    }
    // Run updateFiles before launching Minecraft
    try {
        await updateFiles(win);
    } catch (err) {
        win && win.webContents.send('game-log', '[Launcher Error] Failed to update files: ' + err);
        win && win.webContents.send('toast', { type: 'error', message: 'Failed to update files' });
        win && win.webContents.send('game-status', { running: false });
        return;
    }
    const version = '1.20.1';
    const javaPath = 'java'; // or get from settings
    const destDir = path.resolve(process.env.APPDATA || process.env.HOME, '.axocraft');
    const gameDir = destDir;
    // Default to 4 if not set, clamp between 1 and 16
    let ram = Number(opts.ram);
    if (isNaN(ram)) ram = 4;
    ram = Math.max(1, Math.min(16, ram));
    let minRam = Number(opts.minRam);
    if (isNaN(minRam)) minRam = 2;
    minRam = Math.max(1, Math.min(ram, minRam));
    try {
        // Build Java args array
        let javaArgsArr = [
            `-javaagent:${path.join(gameDir, 'authlib-injector.jar')}=https://nested.candiedapple.me/api/yggdrasil`,
            `-Xmx${ram}G`,
            `-Xms${minRam}G`
        ];
        if (opts.javaArgs && typeof opts.javaArgs === 'string' && opts.javaArgs.trim().length > 0) {
            // Split by spaces, but respect quoted strings
            const customArgs = opts.javaArgs.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
            javaArgsArr = javaArgsArr.concat(customArgs);
        }
        minecraftProcess = await axocore.launch({
                modLoader: 'fabric',
                fabricVersion: 'fabric-loader-0.16.14-1.20.1',
                version,
                username: opts.username,
                password: opts.password,
                javaPath,
                destDir,
                gameDir,
                authServer: 'https://nested.candiedapple.me/api/yggdrasil/authserver',
                javaArgs: javaArgsArr,
                onDownloadProgress: (info) => {
                        win && win.webContents.send('download-progress', info);
                    },
                    onGameLog: (line) => {
                        win && win.webContents.send('game-log', line);
                    }
                });  // Notify renderer that game is running
        win && win.webContents.send('game-status', { running: true });
        if (minecraftProcess && minecraftProcess.on) {
            minecraftProcess.on('exit', () => {
                minecraftProcess = null;
                win && win.webContents.send('game-status', { running: false });
            });
        }
    } catch (err) {
        win && win.webContents.send('game-log', '[Launcher Error] ' + err.message);
        win && win.webContents.send('game-status', { running: false });
        if (err && (err.message?.includes('403') || err.message?.toLowerCase().includes('forbidden'))) {
            win && win.webContents.send('toast', { type: 'error', message: 'Invalid credentials' });
        }
    }
});
