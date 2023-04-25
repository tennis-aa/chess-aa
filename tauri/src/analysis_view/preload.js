const { listen } = window.__TAURI__.event;
const invoke = window.__TAURI__.invoke;

window.engineAPI = {
  uciCmd: (data) => invoke("uci_cmd", {command: data}),
  engineLaunch: () => {console.log("engine-launch"); invoke("launch_engine")},
  engineOnMessage: (callback) => listen("engine-output", (event) => callback(null,event.payload)),
  engineOnSwitch: (callback) => listen("engine-switch", (event) => callback())
};
