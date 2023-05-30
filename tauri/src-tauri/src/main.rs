// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    CustomMenuItem, Menu, Submenu,
    WindowBuilder,
    Window,
    Manager
};

pub mod engine;
use engine::*;

#[tauri::command]
fn onclose(win: Window) {
    println!("Closing tauri app");
    win.close().unwrap();
}

fn main() {
    println!("Starting tauri app");

    let engine_menu = Menu::new()
        .add_item(CustomMenuItem::new("register-engine","Register"))
        .add_item(CustomMenuItem::new("select-engine", "Select"))
        .add_item(CustomMenuItem::new("manage-engine", "Manage"));
    let menu = Menu::new()//os_default("chess-aa-tauri")
        .add_submenu(Submenu::new("Engine",engine_menu));
    tauri::Builder::default()
        .manage(Engine::new())
        .invoke_handler(tauri::generate_handler![uci_cmd,terminate_engine,launch_engine,
            onclose, get_engine_json, write_engine_json])
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
                            search_test_engine(&app_handle).await;
                        });
                    }
                    "select-engine" => {
                        app_handle.emit_all("select-engine-dialog","").unwrap();
                    }
                    "manage-engine" => {
                        app_handle.emit_all("manage-engine-dialog","").unwrap();
                    }
                    _ => {}
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
