const invoke = window.__TAURI__.invoke;

console.log(engines)
let select = document.getElementById("engine_select");
for (let i=0; i<engines.length; ++i) {
  let option = document.createElement("option");
  option.value = i;
  option.textContent = engines[i].name;
  select.appendChild(option);
}

function send_selection() {
  let id = parseInt(document.getElementById("engine_select").value);
  invoke("switch_engine", {id: id});
}