# Get the current directory where the script is executed
$path = Get-Location

# Confirm the operation
Write-Host "Organizing files in the current directory: $path" -ForegroundColor Yellow
Start-Sleep -Seconds 2 # Pause for 2 seconds for the user to see the message

# Organize files into folders by extension
Get-ChildItem -File | ForEach-Object {
    $extension = $_.Extension.TrimStart(".").ToUpper() # Convert the extension to uppercase
    $folder = Join-Path $path $extension

    # Create a folder if it doesn't exist
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder
    }

    # Move the file into the appropriate folder
    Move-Item $_.FullName -Destination $folder
}

Write-Host "Files have been successfully organized by type!" -ForegroundColor Green
