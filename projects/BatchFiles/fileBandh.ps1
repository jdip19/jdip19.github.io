do {
    # Ask the user for the folder path
    $folderPath = Read-Host "Enter the folder path:"
    $outputFile = $folderPath + "\allname.txt"

    # Ask the user for the operation to perform
    Write-Host "What operation do you want to perform?"
    Write-Host "1: List file names"
    Write-Host "2: Create folders named after the files"
    Write-Host "0: Exit"
    $operation = Read-Host "Enter 1, 2, or 0 to exit"

    # If the user chooses to exit
    if ($operation -eq "0") {
        Write-Host "Exiting the script."
        break
    }

    # Get all files
    $files = Get-ChildItem -Path $folderPath -Recurse | Where-Object { -not $_.PSIsContainer }

    if ($operation -eq "1") {
        # Option 1: List all file names and save them in allname.txt
        $files | ForEach-Object { $_.Name } | Out-File -FilePath $outputFile
        Write-Host ("File names have been listed in " + $outputFile)
        Write-Host ("Total number of files listed: " + $files.Count)
    }
    elseif ($operation -eq "2") {
        # Option 2: Create folders based on file names (without extensions)
        foreach ($file in $files) {
            $folderName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
            $newFolderPath = Join-Path -Path $folderPath -ChildPath $folderName
            
            # Check if the folder already exists
            if (-not (Test-Path $newFolderPath)) {
                New-Item -Path $newFolderPath -ItemType Directory | Out-Null
                # Write-Host "Created folder: $folderName"
            }
            else {
                Write-Host "Folder already exists: $folderName"
            }
        }
        Write-Host ("Total number of folders created: " + ($files | Measure-Object).Count)
    }
    else {
        Write-Host "Invalid option. Please enter 1, 2, or 0."
    }

} while ($operation -ne "0")
