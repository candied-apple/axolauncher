# AxoLauncher

AxoLauncher is a desktop application built with Electron and React, designed to provide a modern, customizable launcher experience. It features multiple tabs, theming, update notes, and more.

## Features
- Multi-tab interface (Play, Settings, Logs, Credits, Update Notes)
- Custom theming support
- Modern UI with React and CSS
- Electron-based desktop app
- Modular code structure for easy maintenance

## Project Structure
```
assets/           # App icons and images
src/              # Source code
  index.html      # Main HTML file
  index.css       # Global styles
  main.js         # Electron main process
  preload.js      # Electron preload script
  renderer.js[x]  # React renderer entry
  modules/        # React components (Tabs, Theme, etc.)
webpack.*.js      # Webpack configuration files
forge.config.js   # Electron Forge config
package.json      # Project metadata and scripts
```

## Getting Started

### Prerequisites
- Node.js (v16 or later recommended)
- npm or yarn

### Install dependencies
```powershell
npm install
```

### Run in development mode
```powershell
npm start
```

### Build for production
```powershell
npm run make
```

## Scripts
- `npm start` — Start the app in development mode
- `npm run make` — Package the app for production

## License
MIT
