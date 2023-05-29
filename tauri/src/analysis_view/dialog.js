// registration
let dialog_register = document.getElementById("dialog-engine-registration");
window.register_engine_dialog((event) => {
  dialog_register.showModal();
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
window.select_engine_dialog((engines) => {
  let select = document.getElementById("engine-select");
  select.replaceChildren();
  let option = select.appendChild(document.createElement("option"));
  option.textContent = "-- select engine --";
  option.disabled = true;
  option.selected = true;
  for (let i=0; i<engines.length; ++i) {
    let option = select.appendChild(document.createElement("option"));
    option.value = i;
    option.textContent = engines[i].name;
  }
  dialog_select.showModal();
});

window.send_selection = function() {
  let id = parseInt(document.getElementById("engine-select").value);
  window.select_engine(id);
  dialog_select.close();
}

window.cancel_selection = function() {
  dialog_select.close();
}

// manage
let dialog_manage = document.getElementById("dialog-engine-manage");
let dialog_manage_select = document.getElementById("engine-manage");
let dialog_manage_options = document.getElementById("engine-manage-options");
window.manage_engine_dialog((event) => {
  dialog_manage_select.replaceChildren();
  dialog_manage_options.replaceChildren();
  let option = document.createElement("option");
  option.textContent = "-- select engine --";
  option.disabled = true;
  option.selected = true;
  dialog_manage_select.appendChild(option);
  let engines = event.payload;
  for (let i=0; i<engines.length; ++i) {
    let option = document.createElement("option");
    option.value = i;
    option.textContent = engines[i].name;
    dialog_manage_select.appendChild(option);
  }
  dialog_manage.showModal();
});

dialog_manage_select.onchange = async function(e) {
  dialog_manage_options.replaceChildren();
  let id = parseInt(dialog_manage_select.value);
  let options = await window.engine_options(id);
  let keys = Object.keys(options).sort();
  for (let key of keys) {
    let option = options[key];
    let div = dialog_manage_options.appendChild(document.createElement("div"));
    let input;
    if (key === "MultiPV") {
      div.textContent = "MultiPV is controlled in settings";
    }
    else if (option.type === "button") {
      let b = div.appendChild(document.createElement("button"));
      b.textContent = key;
      b.id = key;
      b.onclick = function (e) {
        window.engine_option_button(id,key);
      }
    }
    else if (option.type === "check") {
      input = document.createElement("input");
      input.setAttribute("type", "checkbox");
      input.checked = option.value;
    }
    else if (option.type === "spin") {
      input = document.createElement("input");
      input.setAttribute("type", "number");
      input.value = option.value;
    }
    else if (option.type === "string") {
      input = document.createElement("input");
      input.value = option.value;
    }
    else if (option.type === "combo") {
      input = document.createElement("select");
      for (let o of option.options) {
        let oo = s.appendChild(document.createElement("option"));
        oo.textContent = o;
      }
      input.value = option.value;
    }
    else {
      div.textContent = key;
    }
    if (input) {
      input.id = key;
      let label = div.appendChild(document.createElement("label"));
      label.setAttribute("for", key);
      label.textContent = key;
      div.appendChild(input);
      if (input.value) {
        input.value = option.value
      }
      else if (input.checked) {
        input.checked = option.value;
      }
      input.onchange = function (e) {
        if (option.type === "spin" && (input.value > option.max || input.value < option.min)) {
          input.value = option.value;
        }
        window.engine_option_update(id,key,input.value);
      }
    }
  }
}

window.delete_manage = function() {
  let id = parseInt(dialog_manage_select.value);
  window.delete_engine(id);
  dialog_manage.close();
}

window.close_manage = function() {
  dialog_manage.close();
}