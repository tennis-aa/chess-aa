const { ipcRenderer } = require('electron');
let path;
ipcRenderer.on("registration_path", (event, p) => {
  path = p;
  let span = document.getElementById("engine_path");
  span.textContent = path;
});

function send_for_registration() {
  let name = document.getElementById("engine_name").value;
  ipcRenderer.send("register", name, path);
}