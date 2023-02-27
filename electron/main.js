"use strict";
const { BrowserWindow, app, Menu } = require("electron");
const path = require("path");
const { engine_menu } = require("./engine_electron"); // Engine communication

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

  // set menu
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
      label: "Mode",
      submenu: [
        {label: "play mode", click: play_mode},
        {label: "analysis mode", click: analysis_mode},
      ]
    }
  ];

  let menu = Menu.buildFromTemplate(template);
  menu.append(engine_menu);
  Menu.setApplicationMenu(menu);
};

// change mode
function play_mode() {
  win.loadFile("play_view/index.html");
}

function analysis_mode() {
  win.loadFile("analysis_view/index.html");
}