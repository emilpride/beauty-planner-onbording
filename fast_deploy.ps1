<#
Fast deploy script for Beauty Mirror Quiz

Goals:
- Build the Next.js app only if sources changed (or if -ForceBuild).
- Deploy only the necessary Firebase targets (hosting by default; add functions/firestore if changed or forced).
- Keep commands Windows-friendly and quick to run.

Usage (PowerShell):
  pwsh -NoProfile -ExecutionPolicy Bypass -File .\fast_deploy.ps1
  pwsh -NoProfile -ExecutionPolicy Bypass -File .\fast_deploy.ps1 -All
  pwsh -NoProfile -ExecutionPolicy Bypass -File .\fast_deploy.ps1 -ForceBuild -ForceFunctions

Notes:
- Requires Firebase CLI installed and logged in (firebase login).
- Uses simple mtime checks to decide what changed. Use -All to force full deploy.
#>

[CmdletBinding()]
param(
  [switch]$All = $false,
  [switch]$ForceBuild = $false,
  [switch]$ForceFunctions = $false
)

$ErrorActionPreference = 'Stop'

function Get-NewestWriteTime([string[]]$Paths) {
  $max = [DateTime]::MinValue
  foreach ($p in $Paths) {
    if (-not (Test-Path $p)) { continue }
    if ((Get-Item $p).PSIsContainer) {
      Get-ChildItem -LiteralPath $p -Recurse -File -Force -ErrorAction SilentlyContinue | ForEach-Object {
        if ($_.LastWriteTime -gt $max) { $max = $_.LastWriteTime }
      }
    } else {
      $itm = Get-Item $p -ErrorAction SilentlyContinue
      if ($itm -and $itm.LastWriteTime -gt $max) { $max = $itm.LastWriteTime }
    }
  }
  return $max
}

$RepoRoot = Split-Path -Parent $PSCommandPath
$AppDir = Join-Path $RepoRoot 'beauty-quiz'
$FunctionsDir = Join-Path $AppDir 'functions'

Write-Host "Repo: $RepoRoot"
Write-Host "App:  $AppDir"

# 1) Decide if app build is needed
$outIndex = Join-Path $AppDir 'out\index.html'
$srcCandidates = @(
  Join-Path $AppDir 'app',
  Join-Path $AppDir 'components',
  Join-Path $AppDir 'public',
  Join-Path $AppDir 'lib',
  Join-Path $AppDir 'store',
  Join-Path $AppDir 'hooks',
  Join-Path $AppDir 'next.config.js',
  Join-Path $AppDir 'tailwind.config.js',
  Join-Path $AppDir 'package.json',
  Join-Path $AppDir 'tsconfig.json'
)

$srcNewest = Get-NewestWriteTime $srcCandidates
$outTime = (Test-Path $outIndex) ? (Get-Item $outIndex).LastWriteTime : [DateTime]::MinValue
$needsBuild = $ForceBuild -or ($srcNewest -gt $outTime)

if ($needsBuild) {
  Write-Host "→ Building Next.js app (changes detected or forced)..." -ForegroundColor Cyan
  Push-Location $AppDir
  npm run build | Write-Output
  Pop-Location
} else {
  Write-Host "✓ Skipping build (no frontend changes detected)." -ForegroundColor Green
}

# 2) Decide targets
$targets = New-Object System.Collections.Generic.List[string]
$targets.Add('hosting')

# Firestore if rules/indexes appear newer than last export (approx) or full deploy requested
$rules = Join-Path $AppDir 'firestore.rules'
$indexes = Join-Path $AppDir 'firestore.indexes.json'
$rulesTime = (Test-Path $rules) ? (Get-Item $rules).LastWriteTime : [DateTime]::MinValue
$indexesTime = (Test-Path $indexes) ? (Get-Item $indexes).LastWriteTime : [DateTime]::MinValue
if ($All -or $rulesTime -gt $outTime -or $indexesTime -gt $outTime) {
  $targets.Add('firestore')
}

# Functions if source changed vs lib or forced
$fnSrcDir = Join-Path $FunctionsDir 'src'
$fnLibDir = Join-Path $FunctionsDir 'lib'
$fnSrcNewest = Get-NewestWriteTime @($fnSrcDir)
$fnLibNewest = Get-NewestWriteTime @($fnLibDir)
$fnChanged = $ForceFunctions -or $All -or ($fnSrcNewest -gt $fnLibNewest)

if ($fnChanged) {
  if (Test-Path $FunctionsDir) {
    Write-Host "→ Building Cloud Functions (changes detected or forced)..." -ForegroundColor Cyan
    Push-Location $FunctionsDir
    npm run build | Write-Output
    Pop-Location
    $targets.Add('functions')
  }
}

$only = ($targets -join ',')
Write-Host "→ Deploying targets: $only" -ForegroundColor Cyan

Push-Location $AppDir
firebase deploy --only "$only"
Pop-Location

Write-Host "✓ Fast deploy complete." -ForegroundColor Green
