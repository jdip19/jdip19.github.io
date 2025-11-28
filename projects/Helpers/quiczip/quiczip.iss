[Setup]
AppName=QuickZip
AppVersion=1.0
DefaultDirName={pf}\QuickZip
DefaultGroupName=QuickZip
UninstallDisplayIcon={app}\Quiczip.exe
OutputDir=output
OutputBaseFilename=QuickZipSetup

[Files]
Source: "build\Release\Quiczip.exe"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\QuickZip"; Filename: "{app}\Quiczip.exe"

[Run]
Filename: "{app}\Quiczip.exe"; Description: "Run QuickZip"; Flags: nowait postinstall skipifsilent
