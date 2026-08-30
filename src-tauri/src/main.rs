// Filename main.rs  Version 0.2.1

use tauri::Emitter;

#[tauri::command]
fn oauth_start(auth_url: String) -> Result<(), String> {
    open::that(auth_url).map_err(|error| error.to_string())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_deep_link::init(|app, urls| {
            if let Some(url) = urls.first() {
                let _ = app.emit("oauth-callback", url.to_string());
            }
        }))
        .invoke_handler(tauri::generate_handler![oauth_start])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
