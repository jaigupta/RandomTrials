const {
  app,
  BrowserWindow,
  dialog,
  Menu,
  MenuItem,
  ipcMain
} = require('electron')

const path = require('path')
const fs = require('fs')
const {
  openFile
} = require(path.resolve('js/open_file'))


let mainWindow;

class FileManager {
  openFile(browserWindow, callback) {
    dialog.showOpenDialog.bind(browserWindow, function(fileNames) {
      if (!fileNames || fileNames.length == 0) return;

      fs.readFile(fileNames[0], 'utf-8', (err, data) => {
        if (err) {
          console.log(err);
          return;
        }
        callback(fileNames[0], data);
      });
    })();
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600
  });

  mainWindow.loadFile('index.html');
  mainWindow.webContents.openDevTools();

  var fileManager = new FileManager();
  const menuTemplate = [{
    label: 'Electron',
    submenu: [{
        label: 'Open File',
        click: () => {
          fileManager.openFile(mainWindow, function(fileName, data) {
            mainWindow.webContents.send('open-file', {
              fileName: fileName,
              data: data
            });
          });
        }
      },
      {
        label: 'Save File',
        click: () => {
          mainWindow.webContents.send('save-file', {});
        }
      }
    ]
  }];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
}

app.on('ready', createWindow)

app.on('window-all-closed', function() {
  app.quit();
})

app.on('activate', function() {
  if (mainWindow === null) createWindow();
})
