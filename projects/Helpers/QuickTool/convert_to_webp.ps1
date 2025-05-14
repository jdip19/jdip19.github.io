Add-Type -AssemblyName System.Windows.Forms

$cwebp = "D:\Jaydip Upadhyay\jdip19.github.io\projects\Helpers\QuickTool\cwebp.exe"
$success = 0
$errors = @()


if ($args.Count -eq 1 -and $args[0] -match '\"') {
    $args = $args[0] -split '"\s+"'
    $args = $args | ForEach-Object { $_ -replace '^"|"$', '' }
}
foreach ($img in $args) {
    try {
        $outputFolder = Split-Path -Path $img
        $filename = [System.IO.Path]::GetFileNameWithoutExtension($img)
        $output = Join-Path $outputFolder "$filename.webp"

        & "$cwebp" "$img" -o "$output" 2>$null

        if (Test-Path $output) {
            $success++
        } else {
            throw "Conversion failed: $img"
        }
    } catch {
        $errors += $_.Exception.Message
    }
}
    

# Toast Notification
[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
$templateType = [Windows.UI.Notifications.ToastTemplateType]::ToastImageAndText02
$template = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent($templateType)

# Set image icon
$imagePath = "file:///D:/Jaydip Upadhyay/jdip19.github.io/projects/Helpers/QuickTool/quicktool.png"
$imageNode = $template.CreateElement("image")
$imageNode.SetAttribute("placement", "appLogoOverride")
$imageNode.SetAttribute("src", $imagePath)
$imageNode.SetAttribute("alt", "QuickTool Icon")
$template.DocumentElement.AppendChild($imageNode) | Out-Null


# Set text
$toastText = $template.GetElementsByTagName("text")
$toastText.Item(0).InnerText = if ($errors.Count -eq 0) { "WebP Conversion Complete" } else { "WebP Conversion Done with Errors" }
$toastText.Item(1).InnerText = "$success converted, $($errors.Count) failed." + ` ($errors.Count -gt 0 ? "`n" + ($errors | Select-Object -First 2 -join "`n") : "")

# Create and show the toast
$toast = [Windows.UI.Notifications.ToastNotification]::new($template)
$notifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("QuickTool")
$notifier.Show($toast)
