const { listen } = window.__TAURI__.event;
const invoke = window.__TAURI__.invoke;

window.engineAPI = {
  uciCmd: (data) => invoke("uci_cmd", {command: data}),
  engineLaunch: () => {invoke("launch_engine")},
  engineOnMessage: (callback) => listen("engine-output", (event) => callback(null,event.payload)),
  engineOnSwitch: (callback) => listen("engine-switch", (event) => callback())
};

window.register_engine = async function(name) {return invoke("register_engine", {name: name});};
window.register_engine_dialog = function(callback) {listen("register-engine-dialog", (event) => callback(event))};

window.select_engine_dialog = function(callback) {listen("select-engine-dialog", (event) => callback(event))};
window.select_engine = function(id) {invoke("switch_engine", {id: id});};
window.select_engine_if_none = function() {invoke("select_engine_if_none");};

window.manage_engine_dialog = function(callback) {listen("manage-engine-dialog", (event) => callback(event))};
window.delete_engine = function(id) {invoke("delete_engine", {id: id});};