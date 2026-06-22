# Deploy Sweden data (GeoJSON + mbtiles) to production VPS and re-import API.
# Requires: OpenSSH scp/ssh, rebuild finished in openbikedata-processor/data/
#
# Usage:
#   .\scripts\deploy-vps-data.ps1
#   .\scripts\deploy-vps-data.ps1 -ServerIp 167.233.153.239 -WaitForRebuild

param(
  [string]$ServerIp = $(if ($env:OPENBIKEMAP_SERVER_IP) { $env:OPENBIKEMAP_SERVER_IP } else { "167.233.153.239" }),
  [string]$SshKey = "$env:USERPROFILE\.ssh\id_ed25519",
  [string]$DataDir = "C:\DEV\openbikedata-processor\data",
  [switch]$WaitForRebuild,
  [switch]$SkipMbtiles,
  [int]$MaxWaitMinutes = 480
)

$ErrorActionPreference = "Stop"

$files = @(
  @{ Name = "trails.geojson"; Required = $true },
  @{ Name = "routes.geojson"; Required = $true },
  @{ Name = "openbikemap.mbtiles"; Required = -not $SkipMbtiles }
)

function Test-DataReady {
  foreach ($file in $files) {
    if (-not $file.Required) { continue }
    $path = Join-Path $DataDir $file.Name
    if (-not (Test-Path $path)) {
      return $false
    }
  }
  return $true
}

function Test-ElevationSample {
  param([string]$Path)
  if (-not (Test-Path $Path)) { return $false }
  $sample = Get-Content $Path -TotalCount 1 -Raw
  return $sample -match "elevationProfile"
}

if ($WaitForRebuild) {
  $deadline = (Get-Date).AddMinutes($MaxWaitMinutes)
  Write-Host "Waiting for rebuild data in $DataDir ..."
  while ((Get-Date) -lt $deadline) {
    if ((Test-DataReady) -and (Test-ElevationSample (Join-Path $DataDir "routes.geojson"))) {
      Write-Host "Data ready (elevationProfile found in routes.geojson)."
      break
    }
    Start-Sleep -Seconds 60
  }
  if (-not (Test-DataReady)) {
    throw "Rebuild data not ready after $MaxWaitMinutes minutes."
  }
  if (-not (Test-ElevationSample (Join-Path $DataDir "routes.geojson"))) {
    Write-Warning "routes.geojson has no elevationProfile - continuing anyway."
  }
}

foreach ($file in $files) {
  if (-not $file.Required) { continue }
  $path = Join-Path $DataDir $file.Name
  if (-not (Test-Path $path)) {
    throw "Missing required file: $path"
  }
  $sizeMb = [math]::Round((Get-Item $path).Length / 1MB, 1)
  Write-Host ("  {0} ({1} MB)" -f $file.Name, $sizeMb)
}

Write-Host "`n==> Uploading to root@${ServerIp}:/opt/openbikemap/data/"
foreach ($file in $files) {
  if (-not $file.Required) { continue }
  $path = Join-Path $DataDir $file.Name
  scp -i $SshKey $path "root@${ServerIp}:/opt/openbikemap/data/"
}

if (-not $SkipMbtiles) {
  Write-Host "`n==> Updating tileserver mbtiles + restart"
  ssh -i $SshKey "root@${ServerIp}" "set -e; cp /opt/openbikemap/data/openbikemap.mbtiles /opt/openbikemap/tiles/mbtiles/; cd /opt/openbikemap/tiles; docker compose -f docker-compose.prod.yml restart"

  Write-Host "`n==> Tile health"
  ssh -i $SshKey "root@${ServerIp}" "curl -sf https://tiles.openbikemap.org/health"
  Write-Host ""
}

Write-Host "`n==> Re-import API (trails + routes GeoJSON)"
ssh -i $SshKey "root@${ServerIp}" "set -e; cd /opt/openbikemap/api; docker compose -f docker-compose.prod.yaml exec -T app npm run import-data:prod -- /data/trails.geojson /data/routes.geojson"

Write-Host "`n==> API health"
ssh -i $SshKey "root@${ServerIp}" "curl -sf https://api.openbikemap.org/health"
Write-Host ""

Write-Host "Deploy complete. Verify: open a route on https://openbikemap.org and check elevation chart."
