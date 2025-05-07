param (
    [string]$imgFile
)

# Get image directory and name
$imgPath = Resolve-Path $imgFile
$imgDir = Split-Path $imgPath -Parent
$imgName = [System.IO.Path]::GetFileNameWithoutExtension($imgPath)
$outputFile = Join-Path $imgDir ($imgName + ".webp")

# Set cwebp path
$cwebpPath = "D:\Jaydip Upadhyay\jdip19.github.io\projects\Helpers\QuickTool\cwebp.exe"

# Convert the image
& "$cwebpPath" "$imgPath" -o "$outputFile"