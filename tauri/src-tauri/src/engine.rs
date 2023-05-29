
use tauri::{
    api::{
        process::{Command,CommandEvent,CommandChild},
        dialog::{blocking::FileDialogBuilder,message},
        path::{BaseDirectory,resolve_path}
    },
    Manager,
    AppHandle
};
use serde_json::{Value};
use std::sync::Mutex;
use std::fs;
use tokio::time::timeout;


pub struct Engine {
    child : Mutex<Option<CommandChild>>,
    index : Mutex<Option<usize>>
}
impl Engine {
    pub fn new() -> Self {
        return Engine {child: Mutex::new(None), index: Mutex::new(None)};
    }
}

pub struct EngineCandidate {
    path : String, 
    options : Value
}
impl EngineCandidate {
    pub fn new() -> Self {
        return EngineCandidate {path: "".to_string(), options: Value::Object(serde_json::Map::new())};
    }
}

#[tauri::command]
pub fn uci_cmd(command: String, engine: tauri::State<Engine>) {
    // println!("command: {}",command);
    let mut child = engine.child.lock().unwrap();
    if let Some(x) = child.as_mut() {
        x.write((command + "\n").as_bytes()).unwrap();
    }
}

#[tauri::command]
pub fn terminate_engine(engine: tauri::State<Engine>) {
    let mut child = engine.child.lock().unwrap();
    let y = child.take();
    if let Some(x) = y {
        x.kill().expect("could not kill engine child process");
    }
}

#[tauri::command]
pub fn launch_engine(app_handle: AppHandle) {
    // Retrieve engine components from managed state
    let engine = app_handle.state::<Engine>();
    let mut child = engine.child.lock().unwrap();
    let index = engine.index.lock().unwrap();

    // Kill the engine if it is running
    let y = child.take();
    if let Some(x) = y {
        x.kill().expect("could not kill engine child process");
    }

    let engine_path : String;
    match *index {
        Some(x) => {
            let json = get_engine_json(&app_handle);
            engine_path = json[x]["path"].as_str().unwrap().to_string();
        }
        None => {
            println!("No engine has been selected");
            return;
        }
    }

    // Spawn the new engine
    let spawn_option = Command::new(engine_path).spawn();
    if let Err(error) = spawn_option {
        println!("{}",error);
        message(app_handle.get_window("main").as_ref(), "Failed to spawn engine", "The selected engine failed to spawn. Select a different engine");
        return;
    }
    let (mut rx, child_temp) = spawn_option.unwrap();
    *child = Some(child_temp);

    // Attach a listener to stdout of the engine to emit the event to the frontend
    let app_handle2 = app_handle.clone();
    tauri::async_runtime::spawn(async move {
        // read events such as stdout
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stdout(line) => {
                    // println!("{}",line);
                    app_handle2.emit_all("engine-output", line.trim()).unwrap();
                }
                CommandEvent::Stderr(line) => {println!("{}",line);}
                CommandEvent::Error(line) => {println!("{}",line);}
                CommandEvent::Terminated(line) => {println!("{:?}",line);}
                _ => todo!()
            }
        }
    });

    // Initialize the engine with the uci command
    child.as_mut().unwrap().write("uci\n".as_bytes()).unwrap();
}

pub async fn search_test_engine(app: &AppHandle) {
    let selected = FileDialogBuilder::new().add_filter("exe",&["exe"]).pick_file();
    if let Some(path) = selected {
        let path = path.to_str().unwrap().to_string();

        let (mut rx, mut child) = Command::new(&path)
        .spawn()
        .expect("Failed to spawn engine");

        app.emit_all("test-engine","").unwrap();

        child.write("uci\n".as_bytes()).unwrap();

        while let Ok(Some(event)) = timeout(std::time::Duration::from_millis(5000), rx.recv()).await {
            match event {
                CommandEvent::Stdout(line) => {
                    // println!("{}",line);
                    app.emit_all("engine-test-output", line.trim()).unwrap();
                    if line.trim() == "uciok" {
                        let engine_candidate = app.state::<Mutex<EngineCandidate>>();
                        let mut engine_candidate = engine_candidate.lock().unwrap();
                        engine_candidate.path = path;
                        // the frontend calls test_engine_passed with the options of the engine 
                        return;
                    }
                }
                CommandEvent::Stderr(line) => {println!("{}",line);}
                CommandEvent::Error(line) => {println!("{}",line); return}
                CommandEvent::Terminated(line) => {println!("{:?}",line); return}
                _ => {return;}
            }
        }
        message(app.get_window("main").as_ref(), "Engine test failed", "The file selected does not appear to be an uci engine");
    }
}

#[tauri::command]
pub fn test_engine_passed(options: Value,app: AppHandle) {
    let candidate = app.state::<Mutex<EngineCandidate>>();
    let mut candidate = candidate.lock().unwrap();
    candidate.options = options;
    app.emit_all("register-engine-dialog", "").unwrap();
}

pub fn get_engine_json(app: &AppHandle) -> Value {
    let mut storage_path = resolve_path(&app.config(), app.package_info(), &app.env(),
        "", Some(BaseDirectory::AppLocalData)).unwrap();
    storage_path.push("engines.json");
    let bytes = fs::read(&storage_path).unwrap_or("[]".as_bytes().to_vec());
    let json : Value = serde_json::from_str(std::str::from_utf8(&bytes).unwrap()).unwrap();
    return json;
}

pub fn write_engine_json(app: &AppHandle, json: &Value) -> std::io::Result<()> {
    let mut storage_path = resolve_path(&app.config(), app.package_info(), &app.env(),
        "", Some(BaseDirectory::AppLocalData)).unwrap();
    storage_path.push("engines.json");
    fs::write(&storage_path,json.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn register_engine(name: String, app: AppHandle, window: tauri::Window) -> bool {
    let mut json = get_engine_json(&app);
    for engine in json.as_array().unwrap() {
        if engine.get("name").expect("engine should have a name").as_str().unwrap() == name {
            message(Some(&window),"Engine name error","The engine name already exists.");
            return false;
        }
    }
    let candidate = app.state::<Mutex<EngineCandidate>>();
    let mut candidate = candidate.lock().unwrap();
    let candidate = std::mem::replace(&mut *candidate, EngineCandidate::new());
    let mut new_engine_json = serde_json::Map::new();
    new_engine_json.insert("name".to_string(), Value::String(name));
    new_engine_json.insert("path".to_string(), Value::String(candidate.path));
    new_engine_json.insert("options".to_string(), candidate.options);
    let new_engine_json = Value::Object(new_engine_json);
    json.as_array_mut().unwrap().push(new_engine_json);
    write_engine_json(&app,&json).expect("should be able to write to the file");
    return true;
}

pub fn select_engine(app: &AppHandle) {
    let json = get_engine_json(&app);
    app.emit_all("select-engine-dialog",json).unwrap();
}

#[tauri::command]
pub fn switch_engine(id: usize, app: AppHandle) {
    let engine = app.state::<Engine>();
    let mut index = engine.index.lock().unwrap();
    *index = Some(id);
    app.emit_all("engine-switch", "").unwrap();
}

#[tauri::command]
pub fn select_engine_if_none(app: AppHandle, engine: tauri::State<Engine>) {
    let child = engine.child.lock().unwrap();
    if let None = *child {
        let json = get_engine_json(&app);
        app.emit_all("select-engine-dialog",json).unwrap();
    }
}

pub fn manage_engine(app: &AppHandle) {
    let json = get_engine_json(&app);
    app.emit_all("manage-engine-dialog",json).unwrap();
}

#[tauri::command]
pub fn delete_engine(id: usize, app: AppHandle) {
    let mut json = get_engine_json(&app);
    json.as_array_mut().unwrap().remove(id);
    write_engine_json(&app, &json).unwrap();

    // update engine index
    let engine = app.state::<Engine>();
    let mut index = engine.index.lock().unwrap();
    let mut child = engine.child.lock().unwrap();
    if let Some(x) = *index {
        if x == id {
            *index = None;
            *child = None;
        }
        else if x > id {
            *index = Some(x-1);
        }
    }
}

#[tauri::command]
pub fn engine_options(mut id: Option<usize>, app: AppHandle, engine: tauri::State<Engine>) -> Value {
    if let None = id {
        id = *engine.index.lock().unwrap();
    }
    match id {
        Some(id) => {
            let json = get_engine_json(&app);
            let options = json.as_array().unwrap()[id].as_object().unwrap()["options"].clone();
            return options;
        }
        None => {
            return Value::Object(serde_json::Map::new());
        }
    }
}

#[tauri::command]
pub fn engine_option_update(id: usize, option_name: String, option_value: Value, app: AppHandle, engine: tauri::State<Engine>) {
    let mut json = get_engine_json(&app);
    let options = &mut json.as_array_mut().unwrap()[id].as_object_mut().unwrap()["options"];
    options[&option_name]["value"] = option_value.clone();
    write_engine_json(&app, &json).expect("error writing to engines.json");

    let index = engine.index.lock().unwrap();
    if let Some(index) = *index {
        if id == index {
            let mut update = serde_json::Map::new();
            update.insert("name".to_string(), Value::String(option_name));
            update.insert("value".to_string(), option_value);
            app.emit_all("engine-option-update",update).expect("Error emitting event engine-option-update");
        }
    }
}

#[tauri::command]
pub fn engine_option_button(id: usize, option_name: String, app: AppHandle, engine: tauri::State<Engine>) {
    let index = engine.index.lock().unwrap();
    if let Some(index) = *index {
        if id == index {
            app.emit_all("engine-option-button",option_name).expect("Error emitting event engine-option-update");
        }
    }
}