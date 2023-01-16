"use strict";
const { BrowserWindow, app, Menu, dialog, ipcMain } = require("electron");
const path = require("path");

// app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
app.commandLine.appendSwitch('enable-features','SharedArrayBuffer');

// Launch app
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin')
    app.quit();
});

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, './preload.js'),
      webSecurity: true
    }
  });
  win.loadFile('analysis_view/index.html');
  // win.webContents.openDevTools();


  let template = [
    {
      label: "Utilities",
      submenu: [
        {role: "reload"},
        {role: "toggleDevTools"},
        {role: "togglefullscreen"}
      ]
    },
    {
      label: "engine",
      submenu: [
        {label: "choose engine", click: select_engine}
      ]
    }
  ];

  let menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

let engine_path;
function select_engine(menu_item, browserwindow, event) {
  let path = dialog.showOpenDialogSync({properties: ["openfile"]})
  if (path) {
    engine_path = path[0];
    win.webContents.send("engine-switch");
  }
}

// ipcMain.on("change-view", (event) => win.loadFile("../index.html"));

// Engine communication

const { spawn } = require('node:child_process');

let engine;
function launchEngine() {
  if (!engine_path) return;
  if (engine) {
    // close previous engine
    engine.kill('SIGINT');
  }
  engine = spawn(engine_path);
  engine.stdin.write("uci\n");

  engine.stdout.setEncoding("utf-8");
  engine.stdin.setEncoding("utf-8");

  engine.stdout.on('data', (data) => {
    let lines = data.split(/\r?\n/);
    for (let i=0; i<lines.length; ++i) {
      // console.log("OUTPUT:",lines[i])
      win.webContents.send("engine-message", lines[i]);
    }
  });

  engine.stdin.on('error', function (err) {});
}

ipcMain.on("uci-cmd", (event, cmd) => {
  // console.log("COMMAND: ", cmd)
  if (engine)
    engine.stdin.write(cmd + "\n");
});

ipcMain.on("engine-launch", (event) => {
  launchEngine();
});
