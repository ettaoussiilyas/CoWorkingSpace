#!/usr/bin/env pwsh
# ⚡ SpaceHub Start Script
# This script starts the entire SpaceHub application with all services

Write-Host "`n" -ForegroundColor Green
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🚀 SpaceHub Application Launcher      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host "`n"

# Navigate to project directory
$projectPath = "C:\Users\ettao\Desktop\spacehub"
Set-Location $projectPath

Write-Host "📍 Working Directory: $projectPath" -ForegroundColor Yellow
Write-Host "`n"

# Show what will happen
Write-Host "📋 What will be started:" -ForegroundColor Yellow
Write-Host "   1. PostgreSQL Database (Port 5432)" -ForegroundColor Gray
Write-Host "   2. Spring Boot Backend (Port 8080)" -ForegroundColor Gray
Write-Host "   3. Angular Frontend + Nginx (Port 80)" -ForegroundColor Gray
Write-Host "   4. pgAdmin Database Manager (Port 5050)" -ForegroundColor Gray
Write-Host "`n"

# Ask for confirmation
$choice = Read-Host "Ready to start SpaceHub? (Y/n)"
if ($choice -ne "Y" -and $choice -ne "y" -and $choice -ne "") {
    Write-Host "`n❌ Cancelled." -ForegroundColor Red
    exit 0
}

Write-Host "`n"
Write-Host "🔄 Starting services..." -ForegroundColor Cyan
Write-Host "`n"

# Option 1: Clean start (with volume reset)
$clean = Read-Host "Clean start (remove old data)? (y/N)"
if ($clean -eq "y" -or $clean -eq "Y") {
    Write-Host "🧹 Cleaning up old containers and volumes..." -ForegroundColor Yellow
    docker-compose down -v
    Write-Host "✅ Cleaned" -ForegroundColor Green
    Write-Host "`n"
}

# Start the application
Write-Host "🚀 Starting Docker services..." -ForegroundColor Cyan
docker-compose up --build

# If we get here, the user stopped the services with Ctrl+C
Write-Host "`n"
Write-Host "⏹️  Services stopped." -ForegroundColor Yellow
Write-Host "`n"

