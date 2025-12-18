@echo off

echo Starting WhatsApp automation...

cd /d C:\Users\jaydi\OneDrive\Desktop\jdip19.github.io\projects\Helpers\
node wph.js
echo Locking system...
rundll32.exe user32.dll,LockWorkStation

exit