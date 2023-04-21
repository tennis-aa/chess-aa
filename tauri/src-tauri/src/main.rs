// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    api::process::{Command,CommandEvent,CommandChild},
    EventHandler    
};
use tauri::Manager;
use std::sync::Mutex;

fn uci_cmd(child: &mut CommandChild, command: &str) {
    // println!("command: {}",command);
    child.write((command.to_owned() + "\n").as_bytes()).unwrap();
}

struct Engine {
    child : Mutex<Option<CommandChild>>,
    listener : Mutex<Option<EventHandler>>
}

fn main() {
    println!("Starting tauri app");

    tauri::Builder::default()
        .manage(Engine {child: Mutex::new(None), listener: Mutex::new(None)})
        .setup(|app| {
            let app_handle = app.handle().clone();
            app.listen_global("launch-engine", move |_event| {

                // Retrieve engine components from smanaged tate
                let engine = app_handle.state::<Engine>();
                let mut child = engine.child.lock().unwrap();
                let mut uci = engine.listener.lock().unwrap();

                // Kill the engine if it is running
                let y = child.take();
                if let Some(x) = y {
                    x.kill().expect("could not kill engine child process");
                    app_handle.unlisten(uci.unwrap());
                    *uci = None;
                }

                // Spawn the new engine
                let (mut rx, child_temp) = Command::new("stockfish14p1")
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

                // Listen to the frontend sending commands to the engine
                let app_handle3 = app_handle.clone();
                let uci_id = app_handle.listen_global("uci-cmd", move |event| {
                    let v : String = serde_json::from_str(event.payload().expect("no command")).expect("");//.unwrap().as_str().expect("not a string");
                    let engine = app_handle3.state::<Engine>();
                    let mut child = engine.child.lock().unwrap();
                    uci_cmd(child.as_mut().unwrap(), v.trim());
                });
                *uci = Some(uci_id);

                // Initialize the engine with the uci command
                uci_cmd(child.as_mut().unwrap(), "uci");
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
