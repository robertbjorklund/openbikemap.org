# Schedule deploy-vps-data.ps1 to run once today at a given local time.
#
# Usage:
#   .\scripts\schedule-deploy-today.ps1 -Time 19:00
#   .\scripts\schedule-deploy-today.ps1 -Time 19:00 -Unregister

param(
  [string]$Time = "19:00",
  [switch]$Unregister
)

$TaskName = "OpenBikeMap-VPS-Deploy"
$RepoRoot = Split-Path $PSScriptRoot -Parent
$DeployScript = Join-Path $RepoRoot "scripts\deploy-vps-data.ps1"
$LogFile = Join-Path $RepoRoot "scripts\deploy-vps-scheduled.log"

if ($Unregister) {
  schtasks /Delete /TN $TaskName /F 2>$null
  Write-Host "Removed scheduled task '$TaskName' (if it existed)."
  exit 0
}

if (-not (Test-Path $DeployScript)) {
  throw "Deploy script not found: $DeployScript"
}

$runAt = [DateTime]::ParseExact($Time, "H:mm", $null)
$today = Get-Date
$scheduled = Get-Date -Year $today.Year -Month $today.Month -Day $today.Day `
  -Hour $runAt.Hour -Minute $runAt.Minute -Second 0

if ($scheduled -le (Get-Date)) {
  throw "Time $Time today has already passed. Pick a future time or run deploy manually."
}

$dateStr = $scheduled.ToString("yyyy/MM/dd")
$timeStr = $scheduled.ToString("HH:mm")

$wrapper = Join-Path $RepoRoot "scripts\deploy-vps-scheduled.cmd"

schtasks /Delete /TN $TaskName /F 2>$null | Out-Null
$result = schtasks /Create /TN $TaskName /SC ONCE /SD $dateStr /ST $timeStr /TR $wrapper /F 2>&1
if ($LASTEXITCODE -ne 0) {
  throw "schtasks failed: $result"
}

Write-Host "Scheduled deploy for $($scheduled.ToString('yyyy-MM-dd HH:mm')) (local time)."
Write-Host "Task name: $TaskName"
Write-Host "Log file:  $LogFile"
Write-Host ""
Write-Host "At run time the task will:"
Write-Host "  1. Commit and push all pending openbikemap.org changes (incl. weather, elevation, SEO)"
Write-Host "  2. Wait for Sweden rebuild, then upload GeoJSON/mbtiles and re-import API"
Write-Host "Cancel: .\scripts\schedule-deploy-today.ps1 -Unregister"
Write-Host "Run now: .\scripts\deploy-vps-scheduled.cmd"
