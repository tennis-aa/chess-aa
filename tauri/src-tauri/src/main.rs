// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    api::{
        process::{Command,CommandEvent,CommandChild},
        dialog::{blocking::FileDialogBuilder,message},
        path::{BaseDirectory,resolve_path}
    },
    Manager,
    AppHandle,
    CustomMenuItem, Menu, Submenu,
    WindowBuilder
};
use serde_json::{Value};
use std::sync::Mutex;
use std::fs;
use tokio::time::timeout;

struct Engine {
    child : Mutex<Option<CommandChild>>,
    index : Mutex<Option<usize>>
}

#[tauri::command]
fn uci_cmd(command: String, engine: tauri::State<Engine>) {
    // println!("command: {}",command);
    let mut child = engine.child.lock().unwrap();
    if let Some(x) = child.as_mut() {
        x.write((command + "\n").as_bytes()).unwrap();
    }
}

#[tauri::command]
fn launch_engine(app_handle: AppHandle) {
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
    let (mut rx, child_temp) = Command::new(engine_path)
        .spawn()
        .expect("Failed to spawn engine");

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

async fn test_engine(path: &str) -> bool {
    // Spawn the new engine
    let (mut rx, mut child) = Command::new(path)
    .spawn()
    .expect("Failed to spawn engine");

    child.write("uci\n".as_bytes()).unwrap();

    // Wait for uciok
    while let Ok(Some(event)) = timeout(std::time::Duration::from_millis(5000), rx.recv()).await {
        match event {
            CommandEvent::Stdout(line) => {
                // println!("{}",line);
                if line.trim() == "uciok" {
                    return true;
                }
            }
            CommandEvent::Stderr(line) => {println!("{}",line);}
            CommandEvent::Error(line) => {println!("{}",line); return false}
            CommandEvent::Terminated(line) => {println!("{:?}",line); return false}
            _ => {return false;}
        }
    }
    return false;
}

async fn search_engine(app: &AppHandle) {
    let selected = FileDialogBuilder::new().add_filter("exe",&["exe"]).pick_file();
    if let Some(path) = selected {
        let test = test_engine(path.to_str().unwrap()).await;
        if test {
            let path = serde_json::to_string(&path).unwrap();
            WindowBuilder::new(
                app,
                "engine-registration".to_string(),
                tauri::WindowUrl::App("modal_windows/modal_engine_registration.html".into()),
                )
                .title("Engine registration")
                .inner_size(350.0,200.0)
                .center()
                .initialization_script(&format!("const path = {}", path))
                .build()
                .expect("error building modal window");
        }
        else {
            message(app.get_window("main").as_ref(), "Engine test failed", "The file selected does not appear to be an uci engine");
        }
    }
}

fn get_engine_json(app: &AppHandle) -> Value {
    let mut storage_path = resolve_path(&app.config(), app.package_info(), &app.env(),
        "", Some(BaseDirectory::AppLocalData)).unwrap();
    storage_path.push("engines.json");
    let bytes = fs::read(&storage_path).unwrap_or("[]".as_bytes().to_vec());
    let json : Value = serde_json::from_str(std::str::from_utf8(&bytes).unwrap()).unwrap();
    return json;
}

fn write_engine_json(app: &AppHandle, json: &Value) -> std::io::Result<()> {
    let mut storage_path = resolve_path(&app.config(), app.package_info(), &app.env(),
        "", Some(BaseDirectory::AppLocalData)).unwrap();
    storage_path.push("engines.json");
    fs::write(&storage_path,json.to_string())?;
    Ok(())
}

#[tauri::command]
fn register_engine(name: String, path: String, app: AppHandle, window: tauri::Window) {
    let mut json = get_engine_json(&app);
    for engine in json.as_array().unwrap() {
        if engine.get("name").expect("engine should have a name").as_str().unwrap() == name {
            message(Some(&window),"Engine name error","The engine name already exists.");
            return;
        }
    }
    let mut new_engine_json = serde_json::Map::new();
    new_engine_json.insert("name".to_string(), Value::String(name));
    new_engine_json.insert("path".to_string(), Value::String(path));
    let new_engine_json = Value::Object(new_engine_json);
    json.as_array_mut().unwrap().push(new_engine_json);
    write_engine_json(&app,&json).expect("should be able to write to the file");
    window.close().expect("should be able to close the window");
}

fn select_engine(app: &AppHandle) {
    let json = get_engine_json(&app);
    let init_script = format!("let engines = {}", json.to_string());

    WindowBuilder::new(
        app,
        "engine-selection".to_string(),
        tauri::WindowUrl::App("modal_windows/modal_engine_selection.html".into()),
        )
        .title("Engine selection")
        .inner_size(350.0,200.0)
        .center()
        .initialization_script(&init_script)
        .build()
        .expect("error building modal window");
}

#[tauri::command]
fn switch_engine(id: usize, app: AppHandle, window: tauri::Window) {
    let engine = app.state::<Engine>();
    let mut index = engine.index.lock().unwrap();
    *index = Some(id);
    app.emit_all("engine-switch", "").unwrap();
    window.close().expect("error closing modal window");
}

fn main() {
    println!("Starting tauri app");

    let engine_menu = Menu::new()
        .add_item(CustomMenuItem::new("register-engine","Register"))
        .add_item(CustomMenuItem::new("select-engine", "Select"));
    let menu = Menu::new()//os_default("chess-aa-tauri")
        .add_submenu(Submenu::new("Engine",engine_menu));
    tauri::Builder::default()
        .manage(Engine {child: Mutex::new(None), index: Mutex::new(None)})
        .invoke_handler(tauri::generate_handler![uci_cmd,launch_engine,register_engine,switch_engine])
        .setup(|app| {
            let window = WindowBuilder::new(
                app,
                "main".to_string(),
                tauri::WindowUrl::App("analysis_view/index.html".into()),
                )
                .menu(menu)
                .title("chess-aa-tauri")
                .inner_size(800.0,600.0)
                .position(200.0,10.0)
                .build()?;
            let app_handle = app.handle();
            window.on_menu_event(move |event| {
                match event.menu_item_id() {
                    "register-engine" => {
                        let app_handle = app_handle.clone();
                        tauri::async_runtime::spawn(async move { 
                            search_engine(&app_handle).await;
                        });
                    }
                    "select-engine" => {
                        select_engine(&app_handle);
                    }
                    _ => {}
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}