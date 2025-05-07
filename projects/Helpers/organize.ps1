while ($true) {
    # Prompt the user to select an operation
    $operation = Read-Host "Select an operation:`n1. Organize Files`n2. Keyword Replace`nPress Q to quit"
    # Prompt the user to select an operation
switch ($operation) {
    '1' {
        # Organize Files
        # Prompt the user for the root folder path
        $folderPath = Read-Host "Enter the root folder path"

        # Prompt the user for folder names as an array
        $folderNames = Read-Host "Enter folder names (comma-separated, e.g., 'DBT Therapy,about us,mental health')" -split ','

        # Loop through each folder name
        foreach ($folderName in $folderNames) {
            # Get all webp files in the folder that contain the folder name
            $imageFiles = Get-ChildItem -Path $folderPath -Filter *.webp | Where-Object { $_.BaseName -match $folderName }

            # Create the folder if it doesn't exist
            $folderPathForImage = Join-Path -Path $folderPath -ChildPath $folderName
            if (-not (Test-Path -Path $folderPathForImage)) {
                New-Item -Path $folderPathForImage -ItemType Directory
            }

            # Move the image files to the corresponding folder
            foreach ($imageFile in $imageFiles) {
                $destinationPath = Join-Path -Path $folderPathForImage -ChildPath $imageFile.Name
                Move-Item -Path $imageFile.FullName -Destination $destinationPath
            }
        }

        Write-Host "Images have been organized into folders."
    }
    '2' {
        # Keyword Replace
        # Prompt the user for the root folder path
        $rootFolderPath = Read-Host "Enter the root folder path"

        # Prompt the user for the keyword to replace
        $replaceKeyword = Read-Host "Enter the keyword to replace"

        # Prompt the user for the keyword to replace with (press Enter to skip)
        $replaceWithKeyword = Read-Host "Enter the keyword to replace with (press Enter to skip)"

        # Get all files in the root folder and its subfolders
        $files = Get-ChildItem -Path $rootFolderPath -Recurse

        $countUpdated = 0

        # Loop through each file
        foreach ($file in $files) {
            # Check if the file name contains the specified keyword
            if ($file.Name -like "*$replaceKeyword*") {
                # Get the new file name by replacing the keyword
                if ($replaceWithKeyword -eq "") {
                    # If no replacement keyword is provided, just remove the specified keyword
                    $newFileName = $file.Name -replace $replaceKeyword
                } else {
                    # Replace the specified keyword with the replacement keyword
                    $newFileName = $file.Name -replace $replaceKeyword, $replaceWithKeyword
                }

                # Construct the target path
                $targetPath = Join-Path -Path $file.Directory.FullName -ChildPath $newFileName

                # Check if the file with the new name already exists
                if (-not (Test-Path -Path $targetPath)) {
                    # Copy the file to the target path with the updated name
                    Copy-Item -Path $file.FullName -Destination $targetPath -Force
                    $countUpdated++
                }
            }
        }

        if ($countUpdated -gt 0) {
            Write-Host "$countUpdated Files Updated '$replaceKeyword' to '$replaceWithKeyword'"
        }

        # Prompt the user to remove files containing the specified keyword
        $confirmation = Read-Host "Do you want to remove files containing '$replaceKeyword'? (Y/N)"
        $countRemoved = 0
        if ($confirmation -eq 'Y' -or $confirmation -eq 'y') {
            # Get all files (including those in subfolders) that contain the specified keyword in their names
            $filesToRemove = Get-ChildItem -Path $rootFolderPath -Recurse | Where-Object { $_.Name -like "*$replaceKeyword*" }

            # Remove each file
            foreach ($fileToRemove in $filesToRemove) {
                Remove-Item -Path $fileToRemove.FullName -Force
                $countRemoved++
            }

            Write-Host "$countRemoved Files containing '$replaceKeyword' have been removed."
        } elseif ($confirmation -ne 'N' -and $confirmation -ne 'n') {
            Write-Host "Invalid input. Please enter Y or N."
        }
    }
    'Q' {
        # Confirm before quitting
        $confirmQuit = Read-Host "Are you sure you want to quit? (Y/N)"
        if ($confirmQuit -eq 'Y' -or $confirmQuit -eq 'y') {
            Write-Host "`n`n Yeah, take a break, you worked hard :)"
            break
        } else {
            Write-Host "Resuming operations."
    }
    }
   Default {
            Write-Host "Invalid selection. Please enter 1, 2, or Q."
        }
    }

}
