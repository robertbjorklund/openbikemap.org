@echo off
set LOG=%~dp0deploy-vps-scheduled.log
echo === %DATE% %TIME% scheduled deploy started ===>> "%LOG%"

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0commit-and-push.ps1" >> "%LOG%" 2>&1
if errorlevel 1 (
  echo commit-and-push failed>> "%LOG%"
  exit /b 1
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy-vps-data.ps1" -WaitForRebuild >> "%LOG%" 2>&1
if errorlevel 1 (
  echo deploy-vps-data failed>> "%LOG%"
  exit /b 1
)

echo === %DATE% %TIME% scheduled deploy finished ===>> "%LOG%"
