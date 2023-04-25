const invoke = window.__TAURI__.invoke;

let span = document.getElementById("engine_path");
span.textContent = path;

function send_for_registration() {
  let name = document.getElementById("engine_name").value;
  invoke("register_engine", {name: name, path: path});
}