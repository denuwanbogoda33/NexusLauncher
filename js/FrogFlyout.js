const TOOLTIP_PLACEHOLDER = `<div class="flymenu-tooltip chip animate__animated animate__fadeIn animate__faster">$1</div>`;
let tooltipShowed = false;

class FrogFlyout {
    // Change panel mode
    static changeMode = (mode) => {
        return new Promise((resolve) => {
            if (FrogFlyout.getCurrentMode() === mode) {
                return resolve(false);
            }
            if (FrogModals.isModalShown("accounts")) {
                FrogModals.hideModal("accounts");
            }
            if (FrogModals.isModalShown("versions")) {
                FrogModals.hideModal("versions");
            }
            FrogCollector.writeLog(`Flyout: New mode - "${mode}"`);
            let allowedModes = ["idle", "progress", "spinner"];
            if (!allowedModes.includes(mode)) {
                return resolve(false);
            }

            let visibleFlyoutElems = $(".flyout .flyout-mode:not(.hidden)");
            visibleFlyoutElems.each(function (i, elem) {
                animateCSSNode($(elem)[0], "fadeOut").then(() => {
                    $(`#${$(elem).attr("id")}`).addClass("hidden");
                    let newModeElem = $(`.flyout > div[data-mode="${mode}"]`);
                    newModeElem.removeClass("hidden");
                    animateCSSNode(newModeElem[0], "fadeIn").then(resolve);
                })
            })
        })
    }

    // Get current UI mode
    static getCurrentMode = () => {
        return $(".flyout .flyout-mode:not(.hidden)").data("mode");
    }

    // Set UI to game start mode (hide/block unnecessary elements)
    static setUIStartMode = (startMode) => {
        FrogModals.switchToContent();
        // Hide all Play buttons in versions list on main screen
        startMode ? $(".versionsPosters").addClass("start-mode") : $(".versionsPosters").removeClass("start-mode");
        FrogCollector.writeLog(`Flyout: UI in start mode: ${startMode}`);
        startMode ? $(".flyout").addClass("start-mode") : $(".flyout").removeClass("start-mode");
    }

    // Set text (set in all modes at once)
    static setText = (text = "", description = "") => {
        if (text !== "") {
            $(".flyout .flyout-mode:not(#versionSelect) .title").text(text);
        }
        if (description !== "") {
            $(".flyout .flyout-mode:not(#versionSelect) .description").show().text(description);
        } else {
            $(".flyout .flyout-mode:not(#versionSelect) .description").hide();
        }
    };

    // Set progress bar value (-1 - infinite)
    static setProgress = (progress) => {
        let progressElem = $(".flyout .progress-pill .inner");
        if (progress < -1 || progress > 100) {
            return false;
        }

        if (progress === -1) {
            progressElem.addClass("indeterminate");
            return true;
        }

        progressElem.removeClass("indeterminate");
        progressElem.css("width", `${progress}%`);
        return true;
    }

    // Show tooltip
    static showTooltip = (menuElement, text) => {
        if (tooltipShowed === true) {
            return false;
        }

        tooltipShowed = true;
        let elementPos = $(menuElement)[0].getBoundingClientRect();
        $("html").append(TOOLTIP_PLACEHOLDER.replaceAll("$1", text))
        let tooltipElement = $(".flymenu-tooltip");
        let tooltipPos = $(tooltipElement)[0].getBoundingClientRect();

        let left = elementPos.left + elementPos.width + 18;
        let top = elementPos.top + (elementPos.height / 2 - tooltipPos.height / 2);

        $(tooltipElement).css("top", top);
        $(tooltipElement).css("left", left);
        return true;
    }

    // Hide tooltip
    static hideTooltip = () => {
        tooltipShowed = false;
        return $(".flymenu-tooltip").remove();
    }

    // Lock FlyMenu for interaction
    static lockFlymenu = () => {
        $(".flymenu").css("pointer-events", "none");
    }

    // Unlock FlyMenu for interaction
    static unlockFlymenu = () => {
        $(".flymenu").css("pointer-events", "initial");
    }

    // Start selected version
    static startSelectedVersion = () => {
        if (FrogAccountsManager.getActiveAccount() === "none") {
            return false;
        }
        let activeVersion = FrogVersionsManager.getActiveVersion();
        FrogStarter.simpleStart(activeVersion);
        return true;
    }
}