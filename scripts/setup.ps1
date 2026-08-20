# PowerShell Environment Setup Script for DevOps Control Center
$ErrorActionPreference = "Stop"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "DevOps Control Center - Local Environment Setup" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Environment file
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

# 2. Backend virtual environment
Write-Host "Setting up Python virtual environment for Backend..." -ForegroundColor Yellow
if (-not (Test-Path "backend\venv")) {
    python -m venv backend\venv
}

& backend\venv\Scripts\python.exe -m pip install --upgrade pip
& backend\venv\Scripts\python.exe -m pip install -r backend\requirements.txt

# 3. Frontend dependencies
Write-Host "Installing Node.js dependencies for Frontend..." -ForegroundColor Yellow
Set-Location frontend
npm install
Set-Location ..

# 4. Initialize Database
Write-Host "Initializing and seeding database..." -ForegroundColor Yellow
& backend\venv\Scripts\python.exe scripts\seed_db.py

Write-Host "============================================================" -ForegroundColor Green
Write-Host "Setup complete! You can now start the application with:" -ForegroundColor Green
Write-Host "  docker-compose up --build" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Green
