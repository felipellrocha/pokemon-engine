import { ipcMain, app, Menu, shell, BrowserWindow } from 'electron';

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  buildMenu() {
    if (process.env.NODE_ENV === 'development') {
      this.setupDevelopmentEnvironment();
    }

    let template = this.buildTemplate();
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment() {
    this.mainWindow.openDevTools();
    this.mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      console.log(e, props);

      Menu.buildFromTemplate([{
        label: 'Inspect element',
        click: () => {
          this.mainWindow.inspectElement(x, y);
        }
      }]).popup(this.mainWindow);
    });
  }

  buildTemplate() {
    const subMenuAbout = {
      label: 'Stark Editor',
      submenu: [
        { label: 'About Stark Editor', selector: 'orderFrontStandardAboutPanel:' },
        { type: 'separator' },
        { label: 'Settings', accelerator: 'Command+G', click: () => { this.mainWindow.send('settings-screen') } },
        { type: 'separator' },
        { label: 'Hide Stark Editor', accelerator: 'Command+H', selector: 'hide:' },
        { label: 'Hide Others', accelerator: 'Command+Shift+H', selector: 'hideOtherApplications:' },
        { label: 'Show All', selector: 'unhideAllApplications:' },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'Command+Q', click: () => {
          app.quit();
        } }
      ]
    };
    const subMenuEdit = {
      label: 'Edit',
      submenu: [
        { label: 'New Game', accelerator: 'Command+N', click: () => {
          this.mainWindow.send('new');
        } },
        { type: 'separator' },
        { label: 'Open', accelerator: 'Command+O', click: () => { this.mainWindow.send('open'); } },
        { type: 'separator' },
        { label: 'Save', accelerator: 'Command+S', click: () => { this.mainWindow.send('save'); } },
        { label: 'Save As', accelerator: 'Command+Shift+S', click: () => { this.mainWindow.send('save-as'); } },
        { type: 'separator' },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" },
        { type: 'separator' },
        { label: 'Undo', accelerator: 'Command+Z', click: () => { this.mainWindow.send('undo'); } },
        { label: 'Redo', accelerator: 'Shift+Command+Z', click: () => { this.mainWindow.send('redo'); } },
      ]
    };
    const subMenuGame = {
      label: 'Game',
      submenu: [
        { label: 'Tiling', accelerator: 'Command+T', click: () => { this.mainWindow.send('tiling-screen'); } },
        { label: 'Textures', accelerator: 'Command+X', click: () => { this.mainWindow.send('textures-screen'); } },
        { label: 'Animations', accelerator: 'Command+Y', click: () => { this.mainWindow.send('animations-screen') } },
        { label: 'Entity', accelerator: 'Command+E', click: () => { this.mainWindow.send('entity-screen') } },
      ]
    };
    const subMenuView = {
      label: 'View',
      submenu: [
        { label: 'Reload', accelerator: 'Command+R', click: () => { this.mainWindow.webContents.reload(); } },
        { label: 'Toggle Full Screen', accelerator: 'Ctrl+Command+F', click: () => { this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen()); } },
        { label: 'Toggle Developer Tools', accelerator: 'Alt+Command+I', click: () => { this.mainWindow.toggleDevTools(); } }
      ]
    };

    return [
      subMenuAbout,
      subMenuEdit,
      subMenuView,
      subMenuGame,
    ];
  }
}
