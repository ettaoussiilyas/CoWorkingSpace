#!/usr/bin/env pwsh
# SpaceHub Status Check Script

Write-Host "🔍 SpaceHub Services Status Check" -ForegroundColor Cyan
Write-Host "==================================`n" -ForegroundColor Cyan

# Check Docker
Write-Host "1️⃣  Checking Docker..." -ForegroundColor Yellow
$dockerStatus = docker ps -q 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Docker is running`n" -ForegroundColor Green
} else {
    Write-Host "❌ Docker is not running`n" -ForegroundColor Red
    exit 1
}

# Check services
Write-Host "2️⃣  Checking Services..." -ForegroundColor Yellow
docker-compose ps --format "{{.Names}}\t{{.Status}}" | Format-Table -AutoSize
Write-Host ""

# Check ports
Write-Host "3️⃣  Checking Ports..." -ForegroundColor Yellow
$ports = @(
    @{ port = 80; service = "Frontend"; url = "http://localhost" },
    @{ port = 8080; service = "Backend"; url = "http://localhost:8080/swagger-ui.html" },
    @{ port = 5432; service = "PostgreSQL"; url = "localhost:5432" },
    @{ port = 5050; service = "pgAdmin"; url = "http://localhost:5050" }
)

foreach ($p in $ports) {
    $tcpConnection = Test-NetConnection -ComputerName localhost -Port $p.port -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    if ($tcpConnection.TcpTestSucceeded) {
        Write-Host "✅ $($p.service) running on port $($p.port)" -ForegroundColor Green
    } else {
        Write-Host "❌ $($p.service) NOT running on port $($p.port)" -ForegroundColor Red
    }
}

Write-Host "`n4️⃣  Quick Links..." -ForegroundColor Yellow
Write-Host "🌐 Frontend: http://localhost" -ForegroundColor Cyan
Write-Host "📚 Swagger: http://localhost:8080/swagger-ui.html" -ForegroundColor Cyan
Write-Host "💾 pgAdmin: http://localhost:5050 (admin@spacehub.local / admin123)" -ForegroundColor Cyan

Write-Host "`n" -ForegroundColor Green

