# bloop App

The bloop app is built using [Tauri](https://github.com/tauri-apps/tauri), a Rust framework for building cross-platform apps.

## Dependencies

To build the Tauri app you need the following dependencies:
- `rustup`
- `clang` `cmake` `wget`
- `protobuf`
- `onnxruntime`

Linux users need to ensure that the following are present:
- `AppImageKit`
- `atk`
- `dbus`
- `glib` `gtk3` (including `webkit-gtk`)
- `pango`
 
## Setup

All commands should be run from the root directory unless specified otherwise.

First make sure dependencies have been downloaded and installed:
```
git lfs install
git lfs pull

npm install
``` 

Install the Tauri CLI:
```
xcode-select --install

curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
```
More info: https://tauri.app/v1/guides/getting-started/prerequisites

Install onnyxruntime from https://github.com/microsoft/onnxruntime/releases/ and put the `libonnxruntime.dylib` file in the `apps/desktop/src-tauri/frameworks` directory.

Then to build the app locally:

```
npm run build-app
```

Alternatively, to run the app in dev mode:
```
npm run start-app
```

## Wiping an index

Deleting and re-indexing the bloop index can fix corruption issues. bloop's index is stored:

| OS      | Index Path |
| ----------- | ----------- |
| MacOS      | `~/Library/Application\ Support/ai.bloop.bloop`       |
| Windows   | `%APPDATA%/bloop`        |
| Linux   | `~/.local/share/bloop`        |