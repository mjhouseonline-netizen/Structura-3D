# Structura 3D — Offline desktop edition

A local desktop build of Structura's 3D modelling studio for Windows and macOS.
The packaged application includes its rendering engine and assets. No internet,
Node.js installation, account, API key, or background web server is needed to use it.
The Gemini cloud assistant is disabled in desktop builds; modelling, furniture,
materials, design pages, project import/export, and image export remain local.

## Windows

Use `Structura-3D-1.0.0-Windows-x64-Setup.exe` to install for your user account.
Or copy the `Portable.exe` to a writable USB drive and double-click it. Keep the
`Structura Data` folder beside the portable executable: it contains the autosaved
workspace. Close the app before ejecting the drive. The portable launcher extracts
runtime files to the computer's temporary directory while it runs.

## Mac

Choose `arm64` for Apple Silicon or `x64` for Intel.
Open the DMG and drag **Structura 3D** into Applications to install. For USB use,
extract the ZIP, copy **Structura 3D.app** onto the writable drive, and put an empty
file named `Structura-Portable.txt` beside the app. Run the app from there; the
`Structura Data` folder beside it holds the workspace. Do not run portable mode
inside the read-only DMG. A downloaded Mac app may be translocated by macOS;
verify that `Structura Data` appears on the USB drive before relying on autosave.

These builds are unsigned and the Mac build is not notarized. Windows or macOS
may require an explicit first-launch approval. Managed devices may prohibit
unsigned apps. Use signed/notarized builds for broad public distribution.

## Moving designs between computers

Use **Save Project** / JSON export to save a `.structura.json` file to the USB drive,
then **Open Project** to open it on another computer. This preserves all design
pages. Windows and Mac use separate autosave profiles, so use project files to
transfer work between them. Autosave is a recovery convenience; keep exported
project files as backups, particularly for large projects.

## Building

Build dependencies need internet once. The resulting app works offline.
Use Node.js 22.12 or newer and npm. `package-lock.json` is the desktop build lockfile.

```sh
npm ci
npm run lint
npm run test:storage
npm run desktop
npm run package:win
```

On a Mac, run `npm run package:mac` for Intel and Apple Silicon DMG/ZIP files.
Outputs appear in `release/`. `.github/workflows/desktop.yml` builds both platforms
on native GitHub runners and uploads packages as workflow artifacts. It runs on
the `codex/offline-desktop` branch and supports manual runs once on the default branch.

`npm run test:desktop` checks Electron startup, WebGL, isolated renderer privileges,
and blocked external requests. It writes a screenshot under `test-output/`.
The original online development server remains available through `npm run dev`.

## Storage and packaging changes

- Electron loads bundled files directly with a sandboxed, isolated renderer.
- External requests and new windows are blocked; no updater is installed.
- Portable builds store profiles alongside the app, separately for each OS.
- Autosave and JSON export preserve all pages and the active page, including empty
  designs. Renames and page changes are saved; pending saves flush on window close.
- npm build dependencies stay outside the packaged app; no API secrets are bundled.
