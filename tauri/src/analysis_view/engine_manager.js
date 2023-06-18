let engine = window.engine; // get engine from main.js
engine.terminate() // in case it was running from a previous session
let engine_test = window.engine_test; // get engine from main.js
let engine_records = await window.readEngineRecords();
let engine_index = null;
window.oncloseApp(() => {
  window.writeEngineRecords(engine_records);
});

let engine_candidate = {name: "", path:"", options:{}};

// testing
window.test_engine(function(path) {
  engine_candidate.path = path;
});

engine_test.dispatcher.addEventListener("chess-aa-engine-uciok", function(event) {
  let options = event.detail.options;
  for (let key in options) {
    if (key === "MultiPV") {
      options[key].default = 3;
      options[key].value = 3;
    }
    else if (options[key].value !== undefined) {
      options[key].default = options[key].value;
    }
  }
  engine_candidate.options = options;
  dialog_register.showModal();
});

// registration
let dialog_register = document.getElementById("dialog-engine-registration");
window.register_engine_listen((event) => {
  dialog_register.showModal();
});

let engine_registration_name = document.getElementById("engine-registration-name");
window.send_for_registration = async function () {
  let name = engine_registration_name.value;
  for (let engine of engine_records) {
    if (engine.name === name) {
      alert("name already exists");
      return;
    }
  }
  engine_candidate.name = name;
  engine_records.push(engine_candidate);
  dialog_register.close();
}

window.cancel_registration = function() {
  dialog_register.close();
}

// selection
let dialog_select = document.getElementById("dialog-engine-selection");
let engine_select = document.getElementById("engine-select");
window.show_select_dialog = function() {
  engine_select.replaceChildren();
  let option = engine_select.appendChild(document.createElement("option"));
  option.textContent = "-- select engine --";
  option.disabled = true;
  option.selected = true;
  for (let i=0; i<engine_records.length; ++i) {
    let option = engine_select.appendChild(document.createElement("option"));
    option.value = i;
    option.textContent = engine_records[i].name;
  }
  if (engine_index !== null) engine_select.value = engine_index;
  dialog_select.showModal();
}
window.select_engine_listen(window.show_select_dialog);

window.send_selection = function() {
  let id = parseInt(engine_select.value);
  engine.launchEngine(engine_records[id].path);
  engine_index = id;
  dialog_select.close();
}

let numberOfLines = document.getElementById("engine-number-of-lines");
engine.dispatcher.addEventListener("chess-aa-engine-uciok", function(event) {
  let options = engine_records[engine_index].options;
  for (let key in options) {
    if (options[key].value)
      engine.setOption(key,options[key].value);
  }
  engine.setOption("MultiPV", parseInt(numberOfLines.value));
  engine.switch(true);
});

window.cancel_selection = function() {
  dialog_select.close();
}

// manage
let dialog_manage = document.getElementById("dialog-engine-manage");
let dialog_manage_select = document.getElementById("engine-manage");
let dialog_manage_options = document.getElementById("engine-manage-options");
window.manage_engine_listen((event) => {
  dialog_manage_select.replaceChildren();
  dialog_manage_options.replaceChildren();
  let option = document.createElement("option");
  option.textContent = "-- select engine --";
  option.disabled = true;
  option.selected = true;
  dialog_manage_select.appendChild(option);
  for (let i=0; i<engine_records.length; ++i) {
    let option = document.createElement("option");
    option.value = i;
    option.textContent = engine_records[i].name;
    dialog_manage_select.appendChild(option);
  }
  dialog_manage.showModal();
});

dialog_manage_select.onchange = function(e) {
  dialog_manage_options.replaceChildren();
  let id = parseInt(dialog_manage_select.value);
  let options = engine_records[id].options;
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
        if (id === engine_index) engine.setOption(key);
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
        let value;
        if (option.type === "spin") {
          value = parseInt(input.value);
          if (value > option.max || value < option.min) {
            input.value = option.value;
            return;
          }
        }
        else if (option.type === "check") {
          value = input.checked;
        }
        else { // string or combo
          value = input.value
        }
        engine_records[id].options[key].value = value;
        if (id === engine_index) {
          engine.setOption(key,value);
        }
      }
    }
  }
}

window.delete_manage = function() {
  let id = parseInt(dialog_manage_select.value);
  engine_records.splice(id,1);
  if (engine_index == id) {
    engine.terminate();
    engine_index = null;
  }
  else if (engine_index > id) {
    engine_index--
  }
  dialog_manage.close();
}

window.close_manage = function() {
  dialog_manage.close();
}