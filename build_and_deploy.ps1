param (
    [switch]$prod,
    [switch]$sync,
    [switch]$upload,
    [switch]$testData,
    [switch]$runLocal
)

$ErrorActionPreference = "Stop"

# Root directory of the viewer
$rootFolder = $PSScriptRoot
if ([string]::IsNullOrEmpty($rootFolder)) {
    $rootFolder = Get-Location
}

# 1. Sync Fork & Tags from Upstream
if ($sync) {
    Write-Host "[SYNC] Starting Upstream Sync..." -ForegroundColor Cyan
    
    # Check if upstream remote exists
    $remotes = git remote
    if ($remotes -notcontains "upstream") {
        Write-Host "[SYNC] Adding upstream remote..." -ForegroundColor Yellow
        git remote add upstream https://github.com/OHIF/Viewers.git
    }

    Write-Host "[SYNC] Fetching upstream master branch and tags..." -ForegroundColor Yellow
    git fetch upstream master --tags

    Write-Host "[SYNC] Merging upstream/master into master..." -ForegroundColor Yellow
    $currentBranch = (git branch --show-current).Trim()
    if ($currentBranch -ne "master") {
        Write-Host "[SYNC] Not on master branch (currently on $currentBranch). Switching to master..." -ForegroundColor Yellow
        git checkout master
    }
    git merge upstream/master

    Write-Host "[SYNC] Pushing updates and tags to origin fork..." -ForegroundColor Yellow
    git push origin master
    git push origin --tags
    
    Write-Host "[SYNC] Completed Successfully." -ForegroundColor Green
}

# 2. Download Job 196 Test Data
if ($testData) {
    Write-Host "[DATA] Fetching Job 196 manifest from Tigris..." -ForegroundColor Cyan
    $apiDir = "d:\Code\Trusttalk\workspace-server-apps\TrustTalkDicomAPI"
    if (Test-Path $apiDir) {
        Push-Location $apiDir
        try {
            $env:ENVIRONMENT = 'dev'
            node download_test_manifest.js
        }
        finally {
            Pop-Location
        }
    } else {
        Write-Error "Could not find TrustTalkDicomAPI directory at $apiDir"
    }
}

# 3. Build Project (Development by default, Production via -prod)
$skipBuild = $sync -or $testData -or $runLocal -or $upload
if ($prod -or -not $skipBuild) {
    Write-Host "[BUILD] Starting Build..." -ForegroundColor Cyan
    Write-Host "[BUILD] Installing dependencies..." -ForegroundColor Yellow
    yarn install

    if ($prod) {
        Write-Host "[BUILD] Building PRODUCTION build..." -ForegroundColor Yellow
        yarn --cwd platform/app run build
    } else {
        Write-Host "[BUILD] Building DEVELOPMENT build..." -ForegroundColor Yellow
        yarn --cwd platform/app run build:dev
    }
    Write-Host "[BUILD] Completed Successfully." -ForegroundColor Green
}

# 4. Local CORS Testing Server Setup & Run
if ($runLocal) {
    Write-Host "[LOCAL] Launching Local Python CORS Server..." -ForegroundColor Cyan
    $distPath = Join-Path $rootFolder "platform\app\dist"
    $dvPath = Join-Path $rootFolder "platform\app\dv"
    $distDvPath = Join-Path $distPath "dv"

    # Ensure build output directory exists
    if (-not (Test-Path $distPath)) {
        Write-Error "Build output directory not found at $distPath. Please run build first."
    }

    # Ensure test data exists in platform/app/dv/dicom.json
    if (-not (Test-Path (Join-Path $dvPath "dicom.json"))) {
        Write-Warning "No test manifest found at $dvPath\dicom.json. Downloading it now..."
        $apiDir = "d:\Code\Trusttalk\workspace-server-apps\TrustTalkDicomAPI"
        Push-Location $apiDir
        try {
            $env:ENVIRONMENT = 'dev'
            node download_test_manifest.js
        } finally {
            Pop-Location
        }
    }

    # Symlink or Copy the dv test data folder to the dist folder so it can be served
    if (-not (Test-Path $distDvPath)) {
        Write-Host "[LOCAL] Linking test data into build output folder..." -ForegroundColor Yellow
        New-Item -ItemType Junction -Path $distDvPath -Value $dvPath
    }

    Write-Host "[LOCAL] Starting Python HTTP Server in platform/app/dist..." -ForegroundColor Yellow
    Push-Location (Join-Path $rootFolder "platform\app\dist")
    try {
        python ../server.py
    } finally {
        Pop-Location
    }
}

# 5. Cloudflare Pages Wrangler Deploy
if ($upload) {
    Write-Host "[DEPLOY] Deploying Build to Cloudflare Pages..." -ForegroundColor Cyan
    $distPath = Join-Path $rootFolder "platform\app\dist"
    
    if (-not (Test-Path $distPath)) {
        Write-Error "Build directory does not exist at $distPath. Please run build first."
    }

    Write-Host "[DEPLOY] Uploading platform/app/dist to Cloudflare Pages..." -ForegroundColor Yellow
    npx wrangler pages deploy "$distPath" --project-name viewer-dwp --branch main
    
    Write-Host "[DEPLOY] Upload Completed successfully." -ForegroundColor Green
}
