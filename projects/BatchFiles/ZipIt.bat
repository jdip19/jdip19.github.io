@echo off
setlocal enabledelayedexpansion

:: Redirect output to NUL to suppress any messages
>nul 2>&1 (

    set "outputZipFile="
    set "fileList="
    set "firstFileName="

    :parseArgs
    if "%~1" neq "" (
        if not defined firstFileName (
            set "firstFileName=%~n1"
        )
        set "fileList=!fileList! "%~1" "
        shift
        goto parseArgs
    )

    :: Check if fileList is not empty
    if not defined fileList (
        echo No files selected. 1>&2  
        exit /b 1
    )

    :: Use the first file name for the zip file name
    set "outputZipFile=%firstFileName%"

    :: Remove quotes if present in the outputZipFile path and replace tilde with underscore
    set "outputZipFile=!outputZipFile:"=!"
    set "outputZipFile=!outputZipFile:~=_!"
    set "outputZipFile=%firstFileName%"

    :: Create a temporary directory
    set "tempDir=%TEMP%\ZipItTemp_%random%"
    mkdir "%tempDir%"

    :: Copy the selected files and subfolders to the temporary directory
    for %%i in (%fileList%) do (
        xcopy "%%~i" "%tempDir%\" /s /i
    )

    :: Create the zip file using Compress-Archive
    powershell -Command "Compress-Archive -Path '%tempDir%\*' -DestinationPath '.\%outputZipFile%.zip' -Force"

    :: Clean up the temporary directory using Remove-Item
    powershell -Command "Remove-Item -Path '%tempDir%' -Recurse -Force"

)

endlocal
