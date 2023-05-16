const { ipcMain, dialog, MenuItem, BrowserWindow } = require("electron");
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
  engine.stdout.setEncoding("utf-8");
  engine.stdin.setEncoding("utf-8");

  engine.stdin.write("uci\n");

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

ipcMain.on("engine-terminate", (event) => {
  if (engine)
    engine.kill("SIGINT");
});

// register engine
function search_engine_to_register(menu_item, browserwindow, event) {
  let path = dialog.showOpenDialogSync(browserwindow,{properties: ["openfile"]});
  if (path) {
    test_engine(path[0], browserwindow);
  }
}

function test_engine(path, browserwindow) {
  let engine_test
  try {
    engine_test = spawn(path);
  } catch {
    console.log("error opening engine at ", path)
    return;
  }
  engine_test.on("close",(code,signal) => console.log("engine_test was closed with (code,signal)=(",code,",",signal,")"));
  engine_test.on("error",err => console.log("error in engine_test", err))
  engine_test.stdout.setEncoding("utf-8");
  engine_test.stdin.setEncoding("utf-8");

  engine_test.stdin.write("uci\n");

  // timeout if we do not receive uciok after 2 seconds
  let timeoutID = setTimeout(() => {
    console.log("engine took too long to respond")
    engine_test.kill("SIGINT");
  },2000)

  engine_test.stdout.on('data', (data) => {
    let lines = data.split(/\r?\n/);
    for (let i=0; i<lines.length; ++i) {
      // console.log("OUTPUT TEST:",lines[i])
      if (lines[i] === "uciok") {
        engine_test.stdin.write("quit\n");
        clearTimeout(timeoutID);
        ask_for_engine_settings(path, browserwindow);
      }
    }
  });
}

let modal;
function ask_for_engine_settings(path, parent) {
  let bounds = parent.getBounds();
  let w = 350;
  let h = 200;
  modal = new BrowserWindow({
    x: bounds.x + bounds.width/2 - w/2,
    y: bounds.y + bounds.height/2 - h/2,
    width: w,
    height: h,
    parent: parent,
    modal: true,
    minimizable: false,
    maximizable: false,
    // frame: false,
    webPreferences: {
      "nodeIntegration": true,
      "contextIsolation": false
    }
  });
  modal.menuBarVisible = false;
  modal.loadFile('modal_windows/modal_engine_registration.html');
  modal.webContents.send("registration_path",path);
}

ipcMain.on("register", (event,name,path) => {
  register_engine(name,path);
  modal.close();
})

function register_engine(name,newenginepath) {
  storage.has("engines", (error, haskey) => {
    if (!haskey) {
      storage.set("engines",[{name: name, path: newenginepath}]);
    }
    else {
      storage.get("engines", (error, data) => {
        data.push({name: name, path: newenginepath});
        storage.set("engines", data);
      });
    }
    engine_list_menu.submenu.append(new MenuItem({label: name, click: select_engine(newenginepath)}));
  });
}


// select engine
function select_engine(path) {
  return function (menu_item, browserwindow, event) {
    engine_path = path;
    browserwindow.webContents.send("engine-switch");
  }
}


let engine_menu = new MenuItem({
  label: "Engine",
  submenu: []
});

engine_menu.submenu.append(new MenuItem({label: "register engine", click: search_engine_to_register}));

let engine_list_menu = new MenuItem({label: "select engine", submenu: []});
engine_menu.submenu.append(engine_list_menu);

storage.has("engines", (error, haskey) => {
  if (haskey) {
    storage.get("engines", (error, data) => {
      for (let i=0; i<data.length; ++i) {
        let eng = data[i];
        engine_list_menu.submenu.append(new MenuItem({label: eng.name, click: select_engine(eng.path)}));
      }
    });
  }
});

module.exports = { engine_menu };