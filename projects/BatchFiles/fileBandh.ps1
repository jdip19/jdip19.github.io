do {
    # Ask the user for the folder path
    $folderPath = Read-Host "Enter the folder path:"
    
    if (-not (Test-Path $folderPath)) {
        Write-Host "The folder path is invalid. Please try again." -ForegroundColor Red
        continue
    } elseif ($folderPath -eq "0") {
        Write-Host "Exiting the script."
        break
    }
   

    $outputCsv = Join-Path $folderPath "file_metadata.csv"

    # Ask the user for the operation to perform
    Write-Host "`nWhat operation do you want to perform?"
    Write-Host "1: Export filenames with last modified date (CSV)"
    Write-Host "2: Create folders named after the files"
    Write-Host "0: Exit"
    $operation = Read-Host "Enter 1, 2, 3, or 0 to exit"

    # If the user chooses to exit
    if ($operation -eq "0") {
        Write-Host "Exiting the script."
        break
    }

    # Get all files
    $files = Get-ChildItem -Path $folderPath -Recurse | Where-Object { -not $_.PSIsContainer }

    switch ($operation) {
        "1" {
            if ($files.Count -eq 0) {
                Write-Host "No files found to export." -ForegroundColor Yellow
            } else {
                $files | Select-Object  @{Name="Date";Expression={$_.LastWriteTime}}, Name |
                    Export-Csv -Path $outputCsv -NoTypeInformation -Encoding UTF8
                Write-Host ("CSV file created: " + $outputCsv)
                Write-Host ("Total number of files listed: " + $files.Count)
            }
        }
        "2" {
            foreach ($file in $files) {
                $folderName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
                $newFolderPath = Join-Path -Path $folderPath -ChildPath $folderName
                if (-not (Test-Path $newFolderPath)) {
                    New-Item -Path $newFolderPath -ItemType Directory | Out-Null
                } else {
                    Write-Host "Folder already exists: $folderName"
                }
            }
            Write-Host ("Total number of folders processed: " + $files.Count)
        }
        Default {
            Write-Host "Invalid option. Please enter 1, 2, 3, or 0."
        }
    }

} while ($operation -ne "0")
