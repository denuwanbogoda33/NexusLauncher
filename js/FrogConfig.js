let mainConfig;
let defaultConfig = {
    accounts: [],
    theme: {
        mode: 'dark',
        color: "rgb(10, 115, 255)"
    },
    // Automatically install updates when downloaded
    autoInstallUpdates: true
};

class FrogConfig {
    // Read config file
    static readConfig() {
        if (fs.existsSync(CONFIG_PATH)) {
            return JSON.parse(fs.readFileSync(CONFIG_PATH));
        } else {
            this.writeConfig(defaultConfig);
            return defaultConfig;
        }
    }

    // Write config file
    static writeConfig(config) {
        fs.writeFileSync(
            CONFIG_PATH,
            JSON.stringify(config, null, "\t")
        );
        return true;
    }

    // Read variable from config
    static read = (key, defaultValue = true) => {
        if (!this.isKeyExists(key)) {
            this.write(key, defaultValue);
            return defaultValue;
        }
        return mainConfig[key];
    };

    // Write variable to config
    static write = (key, value) => {
        mainConfig[key] = value;
        return this.writeConfig(mainConfig);
    }

    // Check if key exists in config
    static isKeyExists = (key) => {
        if (typeof mainConfig === "undefined") {
            return false;
        }
        return typeof mainConfig[key] !== "undefined";
    }
}

mainConfig = FrogConfig.readConfig();