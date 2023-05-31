
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
    child : Mutex<Option<CommandChild>>
}
impl Engine {
    pub fn new() -> Self {
        return Engine {child: Mutex::new(None)};
    }
}

#[tauri::command]
pub fn uci_cmd(command: String, engine: tauri::State<Engine>) {
    // println!("command: {}",command);
    let mut child = engine.child.lock().unwrap();
    if let Some(x) = child.as_mut() {
        x.write((command + "\n").as_bytes()).unwrap_or_else(|_|{println!("engine received command while shut down")});
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
pub fn launch_engine(app_handle: AppHandle, path: String) {
    // Retrieve engine components from managed state
    let engine = app_handle.state::<Engine>();
    let mut child = engine.child.lock().unwrap();

    // Kill the engine if it is running
    let y = child.take();
    if let Some(x) = y {
        x.kill().expect("could not kill engine child process");
    }

    // Spawn the new engine
    let spawn_option = Command::new(path).spawn();
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

        app.emit_all("test-engine",path).unwrap();

        child.write("uci\n".as_bytes()).unwrap();

        while let Ok(Some(event)) = timeout(std::time::Duration::from_millis(5000), rx.recv()).await {
            match event {
                CommandEvent::Stdout(line) => {
                    // println!("{}",line);
                    app.emit_all("engine-test-output", line.trim()).unwrap();
                    if line.trim() == "uciok" {
                        return; // engine is killed when out of scope
                    }
                }
                CommandEvent::Stderr(line) => {println!("{}",line);}
                CommandEvent::Error(line) => {println!("{}",line);}
                CommandEvent::Terminated(line) => {println!("{:?}",line);}
                _ => {}
            }
        }
        message(app.get_window("main").as_ref(), "Engine test failed", "The file selected does not appear to be an uci engine");
    }
}

#[tauri::command]
pub fn get_engine_json(app: AppHandle) -> Value {
    let mut storage_path = resolve_path(&app.config(), app.package_info(), &app.env(),
        "", Some(BaseDirectory::AppLocalData)).unwrap();
    storage_path.push("engines.json");
    let bytes = fs::read(&storage_path).unwrap_or("[]".as_bytes().to_vec());
    let json : Value = serde_json::from_str(std::str::from_utf8(&bytes).unwrap()).unwrap();
    return json;
}

#[tauri::command]
pub fn write_engine_json(app: AppHandle, json: Value) -> bool {
    let mut storage_path = resolve_path(&app.config(), app.package_info(), &app.env(),
        "", Some(BaseDirectory::AppLocalData)).unwrap();
    storage_path.push("engines.json");
    let result = fs::write(&storage_path,json.to_string());
    match result {
        Ok(_) => return true,
        Err(_) => return false
    }
}
