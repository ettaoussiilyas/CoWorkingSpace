# SpaceHub Project - Quick Start Guide

## ✅ Status Summary
- **Frontend (Admin)**: TypeScript ✅ | Tests: 46/46 SUCCESS ✅
- **Backend (Spring Boot)**: Build ✅ | Tests: 65/65 SUCCESS ✅
- **Database**: PostgreSQL (via docker-compose) ✅
- **API**: Running on port 8080 ✅
- **Frontend**: Running on port 80 (docker) or 4200 (dev) ✅

---

## 🚀 Quick Start (Recommended: Docker)

### Option 1: Run Everything with Docker Compose (Easiest)

```powershell
cd 'C:\Users\ettao\Desktop\spacehub'
docker-compose up --build
```

This will start:
- PostgreSQL database on port 5432
- pgAdmin on port 5050 (admin@spacehub.local / admin123)
- Backend Spring Boot on port 8080
- Frontend Angular on port 80

**Then open browser:**
- Frontend: http://localhost
- Backend API: http://localhost:8080
- Swagger API Docs: http://localhost:8080/swagger-ui.html
- pgAdmin: http://localhost:5050

---

## 💻 Run Locally (Dev Mode - No Docker)

### Step 1: Start PostgreSQL Database
```powershell
# Using Docker just for the database
docker run -d --name spacehub-postgres `
  -e POSTGRES_DB=aihub `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=postgres `
  -p 5432:5432 `
  postgres:16
```

### Step 2: Start Backend (Spring Boot)
```powershell
cd 'C:\Users\ettao\Desktop\spacehub\backend'
.\mvnw.cmd spring-boot:run
```
Backend starts on http://localhost:8080

### Step 3: Start Frontend (Angular Dev Server)
In a new terminal:
```powershell
cd 'C:\Users\ettao\Desktop\spacehub\frontend'
npm install  # if not done already
npx ng serve admin --configuration development
```
Frontend starts on http://localhost:4200

---

## 🧪 Run Tests

### Frontend Tests (Admin)
```powershell
cd 'C:\Users\ettao\Desktop\spacehub\frontend\projects\admin'
npm test
```
Expected: **46 tests pass** ✅

### Backend Tests
```powershell
cd 'C:\Users\ettao\Desktop\spacehub\backend'
.\mvnw.cmd test
```
Expected: **65 tests pass** ✅

### TypeScript Check
```powershell
cd 'C:\Users\ettao\Desktop\spacehub\frontend\projects\admin'
npx tsc --noEmit
```
Expected: **No errors** ✅

---

## 🔑 Test API Endpoints (curl examples)

### 1. Register User
```powershell
curl -X POST http://localhost:8080/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "firstName":"Test",
    "lastName":"User",
    "email":"test@example.com",
    "password":"password123"
  }'
```

### 2. Login (Get JWT Token)
```powershell
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "email":"test@example.com",
    "password":"password123"
  }'
```
Response will contain a `token` field. Copy it for authenticated requests.

### 3. Create Booking
```powershell
$TOKEN = "your-token-here"
curl -X POST http://localhost:8080/api/bookings `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $TOKEN" `
  -d '{
    "centerId":1,
    "spaceId":2,
    "from":"2026-04-01T10:00:00",
    "to":"2026-04-01T12:00:00"
  }'
```

### 4. Get My Bookings
```powershell
$TOKEN = "your-token-here"
curl -H "Authorization: Bearer $TOKEN" `
  http://localhost:8080/api/bookings/my
```

---

## 📋 Fixed Files Summary

### Frontend
- ✅ `frontend/projects/admin/src/app/app.spec.ts` - Fixed test imports (RouterTestingModule, IconsModule)
- ✅ `frontend/projects/admin/src/app/app.ts` - Fixed `styleUrl` → `styleUrls`, added IconsModule
- ✅ `frontend/projects/admin/src/app/features/dashboard/dashboard.component.ts` - Added IconsModule import
- ✅ `frontend/projects/admin/src/app/shared/icons/icons.module.ts` - Created centralized icon module
- ✅ `frontend/projects/admin/tsconfig.spec.json` - Fixed Jasmine types config

### Backend
- ✅ Build successful with Maven
- ✅ All 65 unit tests passing

---

## 🛠️ Troubleshooting

### Port Already in Use
```powershell
# Find and kill process on port 8080 (backend)
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Find and kill process on port 5432 (DB)
netstat -ano | findstr :5432
taskkill /PID <PID> /F

# Find and kill process on port 4200 (frontend dev)
netstat -ano | findstr :4200
taskkill /PID <PID> /F
```

### TypeScript Errors in Editor
1. Restart TypeScript server in VS Code: Cmd/Ctrl+Shift+P → "TypeScript: Restart TS server"
2. Ensure you're using workspace TypeScript: Click TS version in status bar → "Use Workspace Version"
3. Close and reopen VS Code

### Tests Won't Run
```powershell
cd 'C:\Users\ettao\Desktop\spacehub\frontend'
npm install  # Reinstall dependencies
npm install --save-dev @types/jasmine  # Install test types explicitly
```

### Database Connection Failed
- Ensure PostgreSQL is running (docker ps should show spacehub-postgres)
- Check credentials in `backend/src/main/resources/application.properties`
- For docker-compose, use `docker-compose logs postgres` to check DB logs

---

## 📊 Project Architecture

```
spacehub/
├── backend/                    # Spring Boot API
│   ├── src/main/java/         # Controllers, Services, Models
│   ├── pom.xml                # Maven dependencies
│   └── target/backend-*.jar   # Compiled JAR
│
├── frontend/                  # Angular workspace
│   ├── projects/admin/        # Admin dashboard (standalone)
│   │   ├── src/app/
│   │   │   ├── app.spec.ts    # Root component test ✅
│   │   │   ├── app.ts         # Root component
│   │   │   ├── shared/icons/  # Centralized icon module
│   │   │   └── features/dashboard/ # Dashboard page
│   │   └── tsconfig.spec.json # Test TypeScript config
│   └── package.json           # npm dependencies
│
├── docker-compose.yml         # Run full stack
└── docs/                      # Documentation
```

---

## 🎯 Next Steps

1. **Start the project**: Run docker-compose or follow local dev mode
2. **Test login**: Use the curl examples above or open http://localhost
3. **Test booking**: Create users, make bookings, verify the flow
4. **Check API**: Open http://localhost:8080/swagger-ui.html for interactive API docs

---

## 📞 Support

If you hit issues:
1. Check the troubleshooting section above
2. Run: `docker-compose down -v && docker-compose up --build` (clean restart)
3. Check backend logs: `docker-compose logs backend`
4. Check frontend build: `npm run build` in frontend folder

---

**Last Updated**: March 30, 2026
**Status**: ✅ All tests passing, ready for deployment

