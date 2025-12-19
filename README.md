# Nexus

Nexus is a Minecraft launcher that lets you run almost any game version, install mods, and create modpacks. It supports both cracked (pirated) and official accounts and offers various appearance settings. Developer: Nexios.Powered by Frog Launcher!!!


## Features

- **Launch almost any versions of Minecraft**
- **Mod installation**: Easy installation of mods from Modrinth
- **Modpack creation**: Create your own modpacks and install them from Modrinth
- **Account support**: Use cracked (pirated) or official Minecraft accounts
- **Extensive customization options**: Change the primary color, launcher background image, and switch between dark and light themes

## Technologies

Nexus is built using the following technologies:

- **Electron**
- **EJS**
- **CSS**
- **jQuery**
- **[minecraft-launcher-core](https://github.com/Pierce01/MinecraftLauncher-core)**
- **[tomate-loaders](https://github.com/doublekekse/tomate-loaders)**
- **[MSMC](https://github.com/Hanro50/MSMC)**

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/Seeroy/FrogLauncher2.git
    cd FrogLauncher2
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Run the launcher:
    ```bash
    npm start
    ```
    
4. You can also use the development mode:
    ```bash
    npm run dev
    ```


## Auto-updates via GitHub Releases

The launcher uses `electron-updater`. To enable automatic updates via GitHub Releases:

- Ensure `build.publish` in `package.json` is configured with the GitHub provider (owner/repo). This repository already has:

  ```json
  "publish": { "provider": "github", "owner": "denuwanbogoda33", "repo": "NexusLauncher" }
  ```

- When you build and publish (using `electron-builder`) the generated artifacts (installer and metadata like `latest.yml`) should be uploaded to a GitHub Release. The recommended way is to run:

  ```bash
  GH_TOKEN=<your_token> npm run build
  # or
  electron-builder --publish always
  ```

  A GitHub token (`GH_TOKEN`) with `repo` scope is required for publishing from CI or locally.

- After a new release is published with the proper artifacts, the launcher will check for updates and download them automatically. If the **"Automatically install updates"** setting is enabled in the launcher, it will install the update immediately after download.

Note: The release must include the installer and the update metadata produced by `electron-builder` for `electron-updater` to function correctly.
    
## License

This project is licensed under the GPL-3.0 license. See [LICENSE](LICENSE) for details.

---

**Nexus** by **Nexios** is a great choice for anyone looking to diversify and enhance their Minecraft experience!
