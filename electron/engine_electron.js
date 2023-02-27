const { ipcMain, dialog, MenuItem } = require("electron");
const { spawn } = require('node:child_process');
const storage = require('electron-json-storage');

let engine;
let engine_path;
function launchEngine(webcontents) {
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
      webcontents.send("engine-message", lines[i]);
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
  launchEngine(event.sender);
});

// register engine
function register_engine(menu_item, browserwindow, event) {
  let path = dialog.showOpenDialogSync({properties: ["openfile"]})
  if (path) {
    let newenginepath = path[0];
    storage.has("engines", (error, haskey) => {
      if (!haskey) {
        storage.set("engines",[newenginepath]);
      }
      else {
        storage.get("engines", (error, data) => {
          console.log(data)
          data.push(newenginepath);
          storage.set("engines", data);
        });
      }
    });
  }
}

// select engine
function select_engine(menu_item, browserwindow, event) {
  let path = dialog.showOpenDialogSync({properties: ["openfile"]})
  if (path) {
    engine_path = path[0];
    browserwindow.webContents.send("engine-switch");
  }
}


let engine_menu = new MenuItem({
  label: "Engine",
  submenu: [
    {label: "choose engine", click: select_engine},
    {label: "register engine", click: register_engine}
  ]
});

module.exports = { engine_menu };