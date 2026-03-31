Write-Host "=== SpaceHub Database Inspection ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Checking database connection..." -ForegroundColor Yellow
docker exec spacehub-postgres psql -U spacehub_user -d spacehub_db -c "SELECT version();" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Database connection successful!" -ForegroundColor Green
} else {
    Write-Host "Database connection failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Tables in Database ===" -ForegroundColor Yellow
docker exec spacehub-postgres psql -U spacehub_user -d spacehub_db -c "\dt"

Write-Host ""
Write-Host "=== Record Counts ===" -ForegroundColor Yellow
docker exec spacehub-postgres psql -U spacehub_user -d spacehub_db -c "SELECT 'Users' as table_name, COUNT(*) as count FROM users UNION ALL SELECT 'Centers', COUNT(*) FROM centers UNION ALL SELECT 'Spaces', COUNT(*) FROM spaces UNION ALL SELECT 'Bookings', COUNT(*) FROM bookings UNION ALL SELECT 'Reviews', COUNT(*) FROM reviews ORDER BY table_name;"

Write-Host ""
Write-Host "=== Database Size ===" -ForegroundColor Yellow
docker exec spacehub-postgres psql -U spacehub_user -d spacehub_db -c "SELECT pg_size_pretty(pg_database_size('spacehub_db')) as database_size;"

Write-Host ""
Write-Host "=== Sample Users ===" -ForegroundColor Yellow
docker exec spacehub-postgres psql -U spacehub_user -d spacehub_db -c "SELECT id, email, role, created_at FROM users LIMIT 5;"

Write-Host ""
Write-Host "Access pgAdmin at: http://localhost:5050" -ForegroundColor Cyan
Write-Host "Login: admin@spacehub.com / admin123" -ForegroundColor Cyan
Write-Host "Host in pgAdmin: spacehub-postgres" -ForegroundColor Yellow
