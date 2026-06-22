# Configure branch protection on OpenBikeMap GitHub repos.
# Prerequisites: gh auth login (once)
# Usage: .\scripts\setup-branch-protection.ps1

$ErrorActionPreference = "Stop"

function Test-GhAuth {
  gh auth status 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Not logged in to GitHub. Run first:" -ForegroundColor Yellow
    Write-Host "  gh auth login" -ForegroundColor Cyan
    exit 1
  }
}

function Set-BasicBranchProtection {
  param(
    [string]$Repo,
    [string]$Branch = "main"
  )

  $body = @{
    required_status_checks       = $null
    enforce_admins               = $false
    required_pull_request_reviews = $null
    restrictions                 = $null
    allow_force_pushes           = $false
    allow_deletions              = $false
  } | ConvertTo-Json -Depth 5

  Write-Host "Protecting $Repo ($Branch): block force push + deletion..." -ForegroundColor Green
  $body | gh api "repos/$Repo/branches/$Branch/protection" -X PUT --input -
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to protect $Repo"
  }
}

function Set-ApiBranchProtection {
  param(
    [string]$Repo = "robertbjorklund/api.openbikemap.org",
    [string]$Branch = "main",
    [string[]]$StatusChecks = @("Build Docker Container")
  )

  $body = @{
    required_status_checks = @{
      strict   = $true
      contexts = $StatusChecks
    }
    enforce_admins                = $false
    required_pull_request_reviews = $null
    restrictions                  = $null
    allow_force_pushes            = $false
    allow_deletions               = $false
  } | ConvertTo-Json -Depth 5

  Write-Host "Protecting $Repo ($Branch): block force push + deletion + CI checks..." -ForegroundColor Green
  $body | gh api "repos/$Repo/branches/$Branch/protection" -X PUT --input -
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: status check protection failed (CI may not have run on main yet)." -ForegroundColor Yellow
    Write-Host "Applying basic protection only..." -ForegroundColor Yellow
    Set-BasicBranchProtection -Repo $Repo -Branch $Branch
  }
}

Test-GhAuth

$repos = @(
  "robertbjorklund/openbikemap.org",
  "robertbjorklund/tiles.openbikemap.org",
  "robertbjorklund/openbikedata-processor"
)

foreach ($repo in $repos) {
  Set-BasicBranchProtection -Repo $repo
}

Set-ApiBranchProtection

Write-Host ""
Write-Host "Done. Verify in GitHub: Settings -> Branches -> Branch protection rules" -ForegroundColor Green
