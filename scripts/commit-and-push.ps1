# Commit all pending frontend changes and push to origin/main.
# Used by deploy-vps-scheduled.cmd before VPS data deploy.
#
# Usage:
#   .\scripts\commit-and-push.ps1

param(
  [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path $PSScriptRoot -Parent
Set-Location $RepoRoot

function Get-AheadCount {
  param([string]$RemoteRef)
  $count = git rev-list --count "$RemoteRef..HEAD" 2>$null
  if ($LASTEXITCODE -ne 0) { return 0 }
  return [int]$count
}

$dirty = git status --porcelain
if (-not $dirty) {
  Write-Host "Working tree clean — nothing to commit."
} else {
  Write-Host "Staging changes (excluding .vscode/) ..."
  git add -A
  if (Test-Path ".vscode") {
    git reset -- .vscode/ 2>$null | Out-Null
  }

  git diff --cached --quiet
  if ($LASTEXITCODE -eq 0) {
    Write-Host "No staged changes after excluding .vscode/."
  } else {
    Write-Host "Committing ..."
    git commit -m "Add elevation profiles, weather forecast, SEO, and deploy scripts." -m "Includes 5-day forecast with wind direction arrows, MTB rain history, route stage weather, merged MultiLineString elevation charts, sitemap/meta tags, and scheduled VPS deploy helpers."
    Write-Host "Commit created: $(git rev-parse --short HEAD)"
  }
}

$remoteRef = "origin/$Branch"
Get-AheadCount $remoteRef | Out-Null
$ahead = Get-AheadCount $remoteRef

if ($ahead -gt 0) {
  Write-Host "Pushing $ahead commit(s) to origin/$Branch ..."
  git push origin $Branch
  Write-Host "Push complete."
} else {
  Write-Host "Branch is up to date with origin/$Branch — no push needed."
}
