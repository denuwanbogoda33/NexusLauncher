class FrogUpdater {
    // Забиндить эвенты обновлений
    static bindUpdate = () => {
        ipcRenderer.once("update-available", () => {
            FrogUpdater.onUpdateAvailable();
        });
        ipcRenderer.once("update-downloaded", () => {
            FrogUpdater.onUpdateDownloaded();
        });
    }

    // При нахождении обновления - показать уведомление
    static onUpdateAvailable = () => {
        let $notifyElem = $("#updateNotify");
        let $notifyElemBtn = $notifyElem.find("button:not(.transparent)");
        let $notifyElemText = $notifyElem.find(".description");
        FrogCollector.writeLog(`Updater: New version found`);
        $notifyElem.show();
        $notifyElem.addClass("animate__animated animate__fadeIn");
        $notifyElemBtn.hide();
        $notifyElemText.text();
        setTimeout(() => {
            $notifyElem.removeClass("animate__animated animate__fadeIn");
        }, 1000);
    }

    // После скачивания обновления - изменить уведомление
    static onUpdateDownloaded = () => {
        let $notifyElem = $("#updateNotify");
        let $notifyElemBtn = $notifyElem.find("button:not(.transparent)");
        let $notifyElemText = $notifyElem.find(".description");
        FrogCollector.writeLog(`Updater: New version downloaded, ready to restart`);
        // If auto install updates is enabled in config - install immediately
        try {
            const autoInstall = FrogConfig.read('autoInstallUpdates', true);
            if (autoInstall === true) {
                FrogCollector.writeLog(`Updater: autoInstall enabled - installing update`);
                ipcRenderer.send('install-update');
                return;
            }
        } catch (e) {
            console.warn('Failed to read autoInstallUpdates setting', e);
        }

        $notifyElemBtn.show();
        $notifyElemText.text(MESSAGES.updater.ready);
    }

    // Установить обновление
    static installUpdate = () => {
        ipcRenderer.send("install-update");
    }
}