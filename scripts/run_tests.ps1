# PowerShell Test Runner Script for DevOps Control Center
$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Running All Tests: Backend & Frontend" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Backend Tests
Write-Host "1. Running Backend Tests..." -ForegroundColor Yellow
& backend\venv\Scripts\python.exe backend\tests\run_tests.py
if ($LASTEXITCODE -ne 0) {
    Write-Error "Backend tests failed."
    exit 1
}

# 2. Frontend Build & Typecheck
Write-Host "2. Running Frontend Build & Typecheck..." -ForegroundColor Yellow
Set-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Set-Location ..
    Write-Error "Frontend build failed."
    exit 1
}
Set-Location ..

Write-Host "============================================================" -ForegroundColor Green
Write-Host "ALL TESTS PASSED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
