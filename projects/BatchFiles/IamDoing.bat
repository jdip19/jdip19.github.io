@echo off
setlocal enabledelayedexpansion

set /p "batScriptPath=Enter the full path to ZipIt.bat: "

:: Remove quotes if present in the provided path
set "batScriptPath=!batScriptPath:"=!"

:: Create "ZipIt" key under HKEY_CLASSES_ROOT\*\shell
reg add "HKEY_CLASSES_ROOT\*\shell\ZipIt" /ve /t REG_SZ /d "ZipIt" /f

:: Create "command" key under HKEY_CLASSES_ROOT\*\shell\ZipIt
reg add "HKEY_CLASSES_ROOT\*\shell\ZipIt\command" /ve /t REG_SZ /d "\"!batScriptPath!\" \"%%1\"" /f

:: Create "ZipIt" key under HKEY_CLASSES_ROOT\Directory\shell
reg add "HKEY_CLASSES_ROOT\Directory\shell\ZipIt" /ve /t REG_SZ /d "ZipIt" /f

:: Create "command" key under HKEY_CLASSES_ROOT\Directory\shell\ZipIt
reg add "HKEY_CLASSES_ROOT\Directory\shell\ZipIt\command" /ve /t REG_SZ /d "\"!batScriptPath!\" \"%%1\"" /f

echo "Registry entries added for ZipIt context menu option."
pause
