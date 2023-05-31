const { listen, TauriEvent } = window.__TAURI__.event;
const invoke = window.__TAURI__.invoke;
const { appWindow } = window.__TAURI__.window

window.engineAPI = {
  uciCmd: (data) => invoke("uci_cmd", {command: data}),
  engineLaunch: (path) => {invoke("launch_engine",{path:path})},
  engineTerminate: () => {invoke("terminate_engine")},
  engineOnMessage: (callback) => listen("engine-output", (event) => callback(null,event.payload)),
};

window.testAPI = {
  uciCmd: (data) => {},
  engineLaunch: () => {},
  engineTerminate: () => {},
  engineOnMessage: (callback) => listen("engine-test-output", (event) => callback(null,event.payload)),
};

window.readEngineRecords = function() {return invoke("get_engine_json",{})};
window.writeEngineRecords = function(json) {invoke("write_engine_json",{json: json})};

window.oncloseApp = function(callback) {
  appWindow.listen(TauriEvent.WINDOW_CLOSE_REQUESTED,(event) => {
    callback();
    invoke("onclose",{});
  });
}

window.test_engine = function(callback) {listen("test-engine",(event) => callback(event.payload));};

// menu events
window.register_engine_listen = function(callback) {listen("register-engine-dialog", (event) => callback(event))};
window.select_engine_listen = function(callback) {listen("select-engine-dialog", (event) => callback())};
window.manage_engine_listen = function(callback) {listen("manage-engine-dialog", (event) => callback(event))};
