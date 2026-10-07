# QuickZip

QuickZip is a small Windows 10/11 x64 tray utility. `Ctrl+Alt+G` creates or extracts ZIP archives and `Ctrl+Alt+W` converts selected JPG/JPEG/PNG files to WebP.

## Build (MinGW-w64)

From an x64 MinGW shell in this directory:

```powershell
cmake -S . -B build -G "MinGW Makefiles" -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release --parallel
```

The first configure downloads Google's libwebp source. The resulting `build/QuickZip.exe` is a GUI executable and links libwebp and the MinGW C++ runtime statically. Copy that EXE to another Windows 10/11 x64 computer.

## Build (Visual Studio)

```powershell
cmake -S . -B build-msvc -G "Visual Studio 17 2022" -A x64
cmake --build build-msvc --config Release
```

The output is `build-msvc/Release/QuickZip.exe`. Internet access is needed once during configure to fetch libwebp. No console window or external runtime DLL is required beyond the normal Windows system libraries.

## Use

Start `QuickZip.exe`; it stays in the notification area. Select files in File Explorer and press `Ctrl+Alt+G` or `Ctrl+Alt+W`. The tray menu opens Settings, where WebP quality, overwrite behavior, recursive folder conversion, and Windows startup can be changed. Settings are stored under the current user's `AppData\\Local\\QuickZip\\settings.ini`. Runtime diagnostics are written to `%LOCALAPPDATA%\\QuickZip\\QuickZip.log`.

ZIP extraction rejects absolute paths and any archive entry containing `..`, and never reuses an existing extraction folder. Operations run on worker threads so the tray remains responsive.

## Icon

`resources/app.ico` is included in the source tree and embedded into the executable through `resources/resource.rc`. Replace it with a branded Windows `.ico` before publishing if desired.
