@echo off
setlocal EnableDelayedExpansion

set "ROOT=%CD%"
set "OUTPUT=%ROOT%\folder_summary.csv"

echo Folder,File Count > "%OUTPUT%"

echo.
echo Scanning:
echo %ROOT%
echo.

for /d %%D in ("%ROOT%\*") do (
    set "COUNT=0"

    for /f %%F in ('dir /a-d /b "%%D" 2^>nul ^| find /c /v ""') do (
        set "COUNT=%%F"
    )

    echo "%%~nxD",!COUNT!>>"%OUTPUT%"
    echo %%~nxD : !COUNT! files
)

echo.
echo --------------------------------
echo Summary created:
echo %OUTPUT%
echo --------------------------------
echo.

pause