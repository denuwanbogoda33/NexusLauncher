let isAppInDev = process.env.LAUNCHER_IN_DEV !== undefined;
let isAppInTest = process.env.LAUNCHER_IN_TEST !== undefined;

if (isAppInDev && !process.argv.includes("noreload")) {
    require('electron-reloader')(module);
}

// Load modules
let startTime = performance.now();
const {app, ipcMain, BrowserWindow, globalShortcut, dialog} = require("electron");
const {autoUpdater} = require("electron-updater");
const os = require("os");
const fs = require("fs");
const path = require("path");
const colors = require("colors");
const {Auth} = require("msmc");
const pjson = require("./package.json");
require('console-stamp')(console);
const userDataPath = app.getPath("userData");

const {forge, neoforge, fabric, quilt, vanilla, liner} = require("tomate-loaders");

let lastLogBack;

// Create global variables to store BrowserWindow
let mainWindowObject;
let mainWindow = require("./windows/mainWindow"); // Module for creating main window
const DEFAULT_USER_AGENT = "FrogLauncher/v" + pjson.version;

// Let's go!
console.log(colors.inverse("FrogLauncher v" + pjson.version + " | Hostname: " + os.hostname() + " | <> by Seeroy"));

app.whenReady().then(() => {
    if (!isAppInDev) {
        console.log(colors.inverse("We are in production mode"));

        // Disable keys for page reload
        app.on('browser-window-focus', function () {
            globalShortcut.register('Control+Shift+I', () => {
                return false;
            });
            globalShortcut.register("CommandOrControl+R", () => {
                return false;
            });
            globalShortcut.register("F5", () => {
                return false;
            });
        });

        app.on('browser-window-blur', function () {
            globalShortcut.unregister('CommandOrControl+R');
            globalShortcut.unregister('F5');
            globalShortcut.unregister('Control+Shift+I');
        });
    } else {
        console.log(colors.inverse("ooo|   Hello, developer   |ooo"));

        // Reset startup time on page reload
        app.on('browser-window-focus', function () {
            globalShortcut.register("CommandOrControl+R", () => {
                startTime = performance.now();
                mainWindowObject.webContents.reloadIgnoringCache();
                return true;
            });
        });

        app.on('browser-window-blur', function () {
            globalShortcut.unregister('CommandOrControl+R');
        });
    }

    // Create main window
    mainWindow.create(function (winObj) {
        mainWindowObject = winObj;
        mainWindowObject.webContents.userAgent = DEFAULT_USER_AGENT;

        // Fix for Alt+F4
        mainWindowObject.on("closed", () => {
            console.log(colors.blue("Bye Bye"));
            app.exit(0);
        })

        autoUpdater.checkForUpdates().then();
        console.log(colors.green("Main window created"));
    });

    // Update found -> send IPC
    autoUpdater.on("update-available", () => {
        console.log("Found an update, downloading...");
        mainWindowObject.webContents.send("update-available");
    });
    // Update file downloaded -> either auto-install (if enabled in config) or send IPC to renderer
    autoUpdater.on("update-downloaded", () => {
        console.log("Update download completed");
        try {
            const configPath = path.join(userDataPath, "config.json");
            let autoInstall = false;
            if (fs.existsSync(configPath)) {
                const cfg = JSON.parse(fs.readFileSync(configPath));
                if (cfg && cfg.autoInstallUpdates === true) {
                    autoInstall = true;
                }
            }
            if (autoInstall === true) {
                console.log(colors.green("Updater: autoInstall enabled - installing update now"));
                autoUpdater.quitAndInstall();
                return;
            }
        } catch (e) {
            console.warn('Failed to check autoInstallUpdates setting', e);
        }

        console.log("Update downloaded, waiting for restart");
        mainWindowObject.webContents.send("update-downloaded");
    });

    // Start update installation
    ipcMain.on("install-update", () => {
        console.log("Installing update...");
        autoUpdater.quitAndInstall();
    });

    // Get userdataPath
    ipcMain.on("get-userdata-path", (e) => {
        e.returnValue = userDataPath;
    });

    // Get isInDev
    ipcMain.on("isAppInDev", (e) => {
        e.returnValue = isAppInDev;
    });

    // Get isInTest
    ipcMain.on("isAppInTest", (e) => {
        e.returnValue = isAppInTest;
    });

    // Launcher startup complete
    ipcMain.on("launcher-ready", (e) => {
        let endTime = performance.now();
        console.log("Launcher started in", colors.yellow(((endTime - startTime) / 1000).toFixed(3) + "s"));
    });

    // Close launcher window
    ipcMain.on("close-main-window", () => {
        console.log(colors.blue("Bye Bye"));
        mainWindowObject.close();
        mainWindowObject = null;
        app.exit(0);
    });

    // Minimize launcher window
    ipcMain.on("hide-main-window", () => {
        mainWindowObject.minimize();
    });

    // Reload launcher window
    ipcMain.on("reload-main-window", () => {
        mainWindowObject.webContents.reload();
    });

    // Maximize launcher window to fullscreen
    ipcMain.on("maximize-main-window", () => {
        if (mainWindowObject.isMaximized()) {
            mainWindowObject.unmaximize();
        } else {
            mainWindowObject.maximize();
        }
    });

    // Completely hide launcher window
    ipcMain.on("disappear-main-window", () => {
        mainWindowObject.hide();
    });

    // Show launcher window
    ipcMain.on("appear-main-window", () => {
        mainWindowObject.show();
        mainWindowObject.focus();
    });

    // Fix for Electron focus issue
    ipcMain.on("focus-fix", () => {
        mainWindowObject.blur();
        mainWindowObject.focus();
    });

    // File open dialog
    ipcMain.handle("open-dialog", async (event, options) => {
        let result = await dialog.showOpenDialog(options);
        if (result.canceled === true) {
            return false;
        }
        return result.filePaths || result.filePath;
    });

    // File save dialog
    ipcMain.handle("save-dialog", async (event, options) => {
        let result = await dialog.showSaveDialog(options);
        if (result.canceled === true) {
            return false;
        }
        return result.filePath;
    });

    // Microsoft authentication
    ipcMain.on("use-ms-auth", (event) => {
        let authManager = new Auth("select_account");
        authManager.launch("electron").then((xboxManager) => {
            xboxManager.getMinecraft().then((result2) => {
                event.sender.send("get-ms-auth-result", {
                    profile: result2.profile,
                    mclc: result2.mclc()
                });
            })
        });
    });

    // Get MCLC configuration
    ipcMain.on("generate-mclc-config", (event, data) => {
        let type = data.type;
        let version = data.version;
        let gameData = data.gameData;

        switch (type) {
            case "vanilla":
                return event.sender.send("get-mclc-config", {
                    version: {
                        type: "release",
                        number: version,
                    },
                    root: gameData
                });
            case "forge":
                return forge.getMCLCLaunchConfig({
                    gameVersion: version,
                    rootPath: gameData
                }).then((result) => {
                    event.sender.send("get-mclc-config", result);
                });
            case "forgeOptiFine":
                return forge.getMCLCLaunchConfig({
                    gameVersion: version,
                    rootPath: gameData
                }).then((result) => {
                    event.sender.send("get-mclc-config", result);
                });
            case "neoforge":
                return neoforge.getMCLCLaunchConfig({
                    gameVersion: version,
                    rootPath: gameData
                }).then((result) => {
                    event.sender.send("get-mclc-config", result);
                });
            case "fabric":
                return fabric.getMCLCLaunchConfig({
                    gameVersion: version,
                    rootPath: gameData
                }).then((result) => {
                    event.sender.send("get-mclc-config", result);
                });
            case "quilt":
                return quilt.getMCLCLaunchConfig({
                    gameVersion: version,
                    rootPath: gameData
                }).then((result) => {
                    event.sender.send("get-mclc-config", result);
                });
        }
    })
});