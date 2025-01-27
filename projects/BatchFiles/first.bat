@REM @echo off
@REM echo Hello, this is a batch file!
@REM pause

@echo off
setlocal enabledelayedexpansion

set "C:\Users\user\OneDrive\Desktop\healingheros\Healing heros"

for %%F in (%folderPath%\*.webp) do (
    for /f "tokens=*" %%a in ("%%~nF") do (
        set "folderKeyword=%%~nxa"
        set "folderKeyword=!folderKeyword:* =!"
        
        set "folderPathForImage=!folderPath!\!folderKeyword!"

        if not exist "!folderPathForImage!" (
            mkdir "!folderPathForImage!"
        )

        move "%%F" "!folderPathForImage!"
    )
)

echo Images have been organized.
pause
