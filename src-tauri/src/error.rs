use serde::Serialize;

/// Structured error type for all Tauri IPC commands.
///
/// Replaces raw `String` errors to provide typed error categories
/// that frontends can pattern-match on for appropriate user feedback.
#[derive(Debug, Serialize)]
pub enum AppError {
    /// Persistent store read/write failure (user.json, system.json).
    Store(String),
    /// Engine lifecycle error (start, stop, restart of aria2c sidecar).
    Engine(String),
    /// File system I/O error.
    Io(String),
    /// Requested resource not found.
    #[allow(dead_code)]
    NotFound(String),
    /// Auto-updater check or install failure.
    Updater(String),
    /// UPnP port mapping error (discovery, map, unmap).
    Upnp(String),
}

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AppError::Store(msg) => write!(f, "Store error: {}", msg),
            AppError::Engine(msg) => write!(f, "Engine error: {}", msg),
            AppError::Io(msg) => write!(f, "IO error: {}", msg),
            AppError::NotFound(msg) => write!(f, "Not found: {}", msg),
            AppError::Updater(msg) => write!(f, "Updater error: {}", msg),
            AppError::Upnp(msg) => write!(f, "UPnP error: {}", msg),
        }
    }
}

impl std::error::Error for AppError {}

impl From<std::io::Error> for AppError {
    fn from(e: std::io::Error) -> Self {
        AppError::Io(e.to_string())
    }
}

impl From<serde_json::Error> for AppError {
    fn from(e: serde_json::Error) -> Self {
        AppError::Store(e.to_string())
    }
}
