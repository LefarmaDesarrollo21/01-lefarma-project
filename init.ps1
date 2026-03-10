# Lefarma Project Initialization Script
# Runs both Backend and Frontend concurrently with Hot Reload

$ErrorActionPreference = "Stop"

$ProjectRoot = $PSScriptRoot
$BackendPath = Join-Path $ProjectRoot "lefarma.backend\src\Lefarma.API"
$FrontendPath = Join-Path $ProjectRoot "lefarma.frontend"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Lefarma Project Initialization" -ForegroundColor Cyan
Write-Host "  HOT RELOAD ENABLED" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$backendPort = 5134
$frontendPort = 5173

# Function to kill process by port
function Stop-ProcessByPort {
    param([int]$Port)
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($connection) {
            $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "  Stopping existing process on port $Port (PID: $($process.Id))..." -ForegroundColor Gray
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                Start-Sleep -Seconds 2
            }
        }
    }
    catch {
        # Ignore errors
    }
}

# Kill existing processes on ports if any
Write-Host "Checking for existing processes..." -ForegroundColor Yellow
Stop-ProcessByPort -Port $backendPort
Stop-ProcessByPort -Port $frontendPort
Write-Host ""

# Create a temporary batch file to run both with hot reload
$batchFile = Join-Path $env:TEMP "lefarma-start.bat"
$batchContent = @"
@echo off
echo ========================================
echo  Lefarma - Backend + Frontend
echo  HOT RELOAD ENABLED
echo ========================================
echo.
echo Backend:  http://localhost:$backendPort
echo Frontend: http://localhost:$frontendPort
echo.
echo [BACKEND] Starting dotnet watch...
echo [FRONTEND] Starting npm run dev...
echo.
echo Press Ctrl+C to stop all services
echo.

start "Lefarma Backend" cmd /k "cd /d "$BackendPath" && title Lefarma Backend && dotnet watch run --launch-profile http"
timeout /t 3 /nobreak >nul
start "Lefarma Frontend" cmd /k "cd /d "$FrontendPath" && title Lefarma Frontend && npm run dev"
"@

$batchContent | Out-File -FilePath $batchFile -Encoding ASCII

Write-Host "[1/2] Starting Backend (.NET API) with Hot Reload..." -ForegroundColor Yellow
Write-Host "[2/2] Starting Frontend (React + Vite) with Hot Reload..." -ForegroundColor Yellow
Write-Host ""

# Execute the batch file
& $batchFile

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Services Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Backend API:  http://localhost:$backendPort" -ForegroundColor Cyan
Write-Host "  Frontend:     http://localhost:$frontendPort" -ForegroundColor Cyan
Write-Host "  Swagger:      http://localhost:$backendPort" -ForegroundColor Cyan
Write-Host ""
Write-Host "  HOT RELOAD ACTIVE:" -ForegroundColor Green
Write-Host "  - Backend window:  .NET Hot Reload (change .cs files)" -ForegroundColor Gray
Write-Host "  - Frontend window: Vite HMR (change .tsx/.css files)" -ForegroundColor Gray
Write-Host ""
Write-Host "  Two windows were opened. Close them to stop services." -ForegroundColor Yellow
Write-Host ""

# Clean up batch file
Remove-Item $batchFile -ErrorAction SilentlyContinue
