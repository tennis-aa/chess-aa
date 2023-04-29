// registration
let dialog_register = document.getElementById("dialog-engine-registration");
window.register_engine_dialog((event) => {
  dialog_register.showModal()
});

window.send_for_registration = async function () {
  let name = document.getElementById("engine-registration-name").value;
  let registered = await register_engine(name);
  if (registered) dialog_register.close();
}

window.cancel_registration = function() {
  dialog_register.close();
}

// selection
let dialog_select = document.getElementById("dialog-engine-selection");
window.select_engine_dialog((event) => {
  let select = document.getElementById("engine-select");
  select.replaceChildren();
  let engines = event.payload;
  for (let i=0; i<engines.length; ++i) {
    let option = document.createElement("option");
    option.value = i;
    option.textContent = engines[i].name;
    select.appendChild(option);
  }
  dialog_select.showModal()
});

window.send_selection = function() {
  let id = parseInt(document.getElementById("engine-select").value);
  window.select_engine(id);
  dialog_select.close();
}

window.cancel_selection = function() {
  dialog_select.close();
}