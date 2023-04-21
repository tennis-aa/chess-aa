const { emit, listen } = window.__TAURI__.event;

window.engineAPI = {
  uciCmd: (data) => emit("uci-cmd", data),
  engineLaunch: () => {console.log("engine-launch"); emit("launch-engine")},
  engineOnMessage: (callback) => listen("engine-output", (event) => callback(null,event.payload)),
  engineOnSwitch: (callback) => {}
};
