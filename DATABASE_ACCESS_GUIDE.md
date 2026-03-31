# SpaceHub Database Access Guide

## Container Information
- **Postgres Container**: `spacehub-postgres` (ID: a57391968ed9)
- **pgAdmin Container**: `spacehub-pgadmin` (ID: 78e7719c5429)
- **Backend Container**: `spacehub-backend` (ID: 16ac4f537962)
- **Frontend Container**: `spacehub-frontend` (ID: 4a7499e29d7b)

## Database Credentials
- **Database Name**: spacehub_db
- **Username**: spacehub_user
- **Password**: spacehub_password
- **Port**: 5432

---

## METHOD 1: pgAdmin Web Interface (RECOMMENDED - EASIEST)

### Step 1: Open pgAdmin
Open browser: http://localhost:5050

### Step 2: Login
- Email: `admin@spacehub.com`
- Password: `admin123`

### Step 3: Add Server Connection
1. Click "Add New Server" or right-click "Servers" → "Register" → "Server"
2. **General Tab**:
   - Name: `SpaceHub`
3. **Connection Tab**:
   - Host: `spacehub-postgres` (container name)
   - Port: `5432`
   - Database: `spacehub_db`
   - Username: `spacehub_user`
   - Password: `spacehub_password`
   - ✓ Save password
4. Click "Save"

### Step 4: Browse Data
Navigate: Servers → SpaceHub → Databases → spacehub_db → Schemas → public → Tables
Right-click any table → "View/Edit Data" → "All Rows"

---

## METHOD 2: Command Line Access

### Connect to Database
```powershell
docker exec -it spacehub-postgres psql -U spacehub_user -d spacehub_db
```

### Useful SQL Commands
```sql
-- List all tables
\dt

-- View table structure
\d users
\d spaces
\d bookings
\d reservations

-- View all data
SELECT * FROM users;
SELECT * FROM spaces;
SELECT * FROM bookings;

-- Count records
SELECT 
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM spaces) as total_spaces,
  (SELECT COUNT(*) FROM bookings) as total_bookings;

-- View recent bookings
SELECT * FROM bookings ORDER BY created_at DESC LIMIT 10;

-- Exit
\q
```

---

## METHOD 3: Quick Database Inspection Script

Create file: `inspect_db.ps1`
```powershell
Write-Host "=== SpaceHub Database Inspection ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Tables in database:" -ForegroundColor Yellow
docker exec -it postgres psql -U spacehub_user -d spacehub_db -c "\dt"

Write-Host ""
Write-Host "Record counts:" -ForegroundColor Yellow
docker exec -it postgres psql -U spacehub_user -d spacehub_db -c "SELECT 'Users' as table_name, COUNT(*) as count FROM users UNION ALL SELECT 'Spaces', COUNT(*) FROM spaces UNION ALL SELECT 'Bookings', COUNT(*) FROM bookings;"

Write-Host ""
Write-Host "Database size:" -ForegroundColor Yellow
docker exec -it postgres psql -U spacehub_user -d spacehub_db -c "SELECT pg_size_pretty(pg_database_size('spacehub_db')) as database_size;"
```

Run: `.\inspect_db.ps1`

---

## METHOD 4: Export Database Schema

```powershell
# Export schema only
docker exec spacehub-postgres pg_dump -U spacehub_user -d spacehub_db --schema-only > schema.sql

# Export data only
docker exec spacehub-postgres pg_dump -U spacehub_user -d spacehub_db --data-only > data.sql

# Export everything
docker exec spacehub-postgres pg_dump -U spacehub_user -d spacehub_db > full_backup.sql
```

---

## Troubleshooting

### If pgAdmin shows connection error:
- Make sure you use `postgres` (container name) NOT `localhost` as host
- Verify containers are running: `docker ps`

### If command line fails:
```powershell
# Check if postgres container is running
docker ps | findstr spacehub-postgres

# Check postgres logs
docker logs spacehub-postgres

# Restart postgres if needed
docker restart spacehub-postgres
```

### View Backend Logs (if database issues):
```powershell
docker logs spacehub-backend --tail 50
```

---

## Quick Access URLs
- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **pgAdmin**: http://localhost:5050
- **Database**: localhost:5432 (from host machine)
