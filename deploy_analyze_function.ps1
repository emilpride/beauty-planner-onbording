<#
Deploy helper for analyzeUserData Cloud Function
- Prompts securely for Gemini API key
- Creates secret in Secret Manager (gemini_key) or adds a new version if it exists
- Deploys Cloud Function analyzeUserData and binds secret via --set-secrets
- Fetches the function HTTPS URL and writes to beauty-quiz/.env.local as ANALYZE_FN_URL
- Optionally sends a small test POST to the function

Usage: run from PowerShell after installing Google Cloud SDK and authenticating (gcloud auth login)
    pwsh .\deploy_analyze_function.ps1

Notes:
- This script expects gcloud on PATH. If not installed, follow: https://cloud.google.com/sdk/docs/install
- Project ID and region are prefilled for your project. Modify $ProjectId / $Region variables if needed.
- The function runtime defaults to nodejs20. Change $Runtime if you need nodejs18.
#>

# Fail on any error
$ErrorActionPreference = 'Stop'

# Configuration - change if needed
$ProjectId = 'beauty-planner-26cc0'
$Region = 'us-central1'
$SecretId = 'gemini_key'
$FunctionName = 'analyzeUserData'
$Runtime = 'nodejs20'  # change to nodejs18 if you prefer
$EnvFilePath = Join-Path -Path (Join-Path -Path (Get-Location) -ChildPath 'beauty-quiz') -ChildPath '.env.local'

function AbortIfNoGcloud {
    if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
        Write-Error 'gcloud not found on PATH. Please install Google Cloud SDK and authenticate (gcloud auth login). See: https://cloud.google.com/sdk/docs/install'
        exit 1
    }
}

AbortIfNoGcloud

Write-Host 'gcloud found:' (Get-Command gcloud).Source
Write-Host "Project: $ProjectId, Region: $Region, Function: $FunctionName"

# Prompt for Gemini API key securely
$secure = Read-Host -Prompt 'Paste Gemini API key (input hidden)' -AsSecureString
$ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
$key = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($ptr)
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)

# Create a temp file to pass to gcloud (avoid newlines)
$temp = [System.IO.Path]::GetTempFileName()
Set-Content -Path $temp -Value $key -NoNewline -Encoding UTF8

try {
    Write-Host "Creating secret '$SecretId' in project $ProjectId..."
    & gcloud secrets create $SecretId --project=$ProjectId --replication-policy='automatic' --data-file=$temp
    Write-Host 'Secret created.'
} catch {
    $msg = $_.Exception.Message
    if ($msg -match 'already exists') {
        Write-Host 'Secret already exists — adding a new version...'
        & gcloud secrets versions add $SecretId --project=$ProjectId --data-file=$temp
        Write-Host 'Added new secret version.'
    } else {
        Write-Error "Failed to create/add secret: $msg"
        Remove-Item $temp -ErrorAction SilentlyContinue
        exit 1
    }
}

# Remove temp file holding the key
Remove-Item $temp -ErrorAction SilentlyContinue

# Deploy the function with the secret bound into env var GEMINI_API_KEY
Write-Host "Deploying Cloud Function '$FunctionName' (this may take a few minutes)..."
$secretResourcePath = "projects/$ProjectId/secrets/$SecretId:latest"
$secretArgument = "GEMINI_API_KEY=$secretResourcePath"

try {
    & gcloud functions deploy $FunctionName --project=$ProjectId --region=$Region --runtime=$Runtime --trigger-http --allow-unauthenticated --set-secrets=$secretArgument
} catch {
    Write-Error "gcloud deploy failed: $($_.Exception.Message)"
    exit 1
}

Write-Host 'Deploy finished. Fetching function URL...'
$fnUrl = & gcloud functions describe $FunctionName --project=$ProjectId --region=$Region --format='value(httpsTrigger.url)'
if (-not $fnUrl) {
    Write-Error 'Failed to obtain function URL. Check function status in GCP console or gcloud functions describe output.'
    exit 1
}
Write-Host "Function URL: $fnUrl"

# Write ANALYZE_FN_URL to .env.local in beauty-quiz (create or update)
if (-not (Test-Path (Split-Path $EnvFilePath -Parent))) {
    New-Item -ItemType Directory -Path (Split-Path $EnvFilePath -Parent) -Force | Out-Null
}

$envLine = "ANALYZE_FN_URL=$fnUrl"
if (Test-Path $EnvFilePath) {
    $lines = Get-Content $EnvFilePath -ErrorAction SilentlyContinue
    $found = $false
    for ($i = 0; $i -lt $lines.Length; $i++) {
        if ($lines[$i] -like 'ANALYZE_FN_URL=*') {
            $lines[$i] = $envLine
            $found = $true
            break
        }
    }
    if (-not $found) {
        $lines += $envLine
    }
    $lines | Set-Content -Path $EnvFilePath -Encoding UTF8
} else {
    Set-Content -Path $EnvFilePath -Value $envLine -Encoding UTF8
}
Write-Host "Wrote ANALYZE_FN_URL to $EnvFilePath"

# Optionally run a test POST
$runTest = Read-Host -Prompt 'Run quick test POST to the function now? (y/N)'
if ($runTest -match '^(y|Y)') {
    try {
        $payload = @{ userId = 'test_user_local'; answers = @{ test = 'x' }; photoUrls = @{ face = ''; hair = ''; body = '' } }
        $body = $payload | ConvertTo-Json -Compress
        Write-Host 'Sending test request to function...'
        $resp = Invoke-RestMethod -Uri $fnUrl -Method Post -Body $body -ContentType 'application/json'
        Write-Host 'Response:'
        Write-Host (ConvertTo-Json $resp -Depth 5)
    } catch {
        Write-Error "Test request failed: $($_.Exception.Message)"
    }
}

Write-Host "Done. If you host the Next app (Vercel, Firebase), set ANALYZE_FN_URL in that environment as well (value = $fnUrl)."
Write-Host "If you need help reviewing logs: gcloud functions logs read $FunctionName --project=$ProjectId --region=$Region --limit=50"