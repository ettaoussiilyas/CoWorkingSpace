# ⚡ Quick Command Reference

## 🚀 START PROJECT (Pick One)

### 1️⃣ DOCKER (Easiest - Everything in One Command)
```powershell
cd 'C:\Users\ettao\Desktop\spacehub'
docker-compose up --build
```
✅ Starts: PostgreSQL + Backend + Frontend automatically
🌐 Open: http://localhost

---

### 2️⃣ LOCAL DEV (If you prefer running services separately)

**Open 3 Terminal Windows:**

**Terminal 1 - Database**:
```powershell
docker run -d --name spacehub-postgres `
  -e POSTGRES_DB=aihub `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_PASSWORD=postgres `
  -p 5432:5432 postgres:16
```

**Terminal 2 - Backend**:
```powershell
cd 'C:\Users\ettao\Desktop\spacehub\backend'
.\mvnw.cmd spring-boot:run
```
✅ Backend ready at: http://localhost:8080

**Terminal 3 - Frontend**:
```powershell
cd 'C:\Users\ettao\Desktop\spacehub\frontend'
npx ng serve admin --configuration development
```
✅ Frontend ready at: http://localhost:4200

---

## 🧪 RUN TESTS

### Frontend Tests
```powershell
cd 'C:\Users\ettao\Desktop\spacehub\frontend\projects\admin'
npm test
```
Expected: ✅ 46/46 SUCCESS

### Backend Tests
```powershell
cd 'C:\Users\ettao\Desktop\spacehub\backend'
.\mvnw.cmd test
```
Expected: ✅ 65/65 SUCCESS

### TypeScript Check
```powershell
cd 'C:\Users\ettao\Desktop\spacehub\frontend\projects\admin'
npx tsc --noEmit
```
Expected: ✅ No errors

---

## 📝 TEST API (with curl)

### 1. Register User
```powershell
curl -X POST http://localhost:8080/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "firstName":"John",
    "lastName":"Doe",
    "email":"john@example.com",
    "password":"secure123"
  }'
```

### 2. Login (Get Token)
```powershell
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "email":"john@example.com",
    "password":"secure123"
  }'
```
💾 **Copy the `token` from response**

### 3. Create Booking
```powershell
$TOKEN = "your_copied_token_here"
curl -X POST http://localhost:8080/api/bookings `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $TOKEN" `
  -d '{
    "centerId":1,
    "spaceId":2,
    "from":"2026-04-01T09:00:00",
    "to":"2026-04-01T17:00:00"
  }'
```

### 4. Get My Bookings
```powershell
$TOKEN = "your_copied_token_here"
curl -H "Authorization: Bearer $TOKEN" `
  http://localhost:8080/api/bookings/my
```

### 5. Interactive Swagger UI
Open in browser: **http://localhost:8080/swagger-ui.html**

---

## 🌐 ACCESS POINTS

| What | URL | Use |
|------|-----|-----|
| **Frontend** | http://localhost | User dashboard |
| **Backend API** | http://localhost:8080 | API calls |
| **Swagger Docs** | http://localhost:8080/swagger-ui.html | Try API endpoints |
| **pgAdmin** | http://localhost:5050 | Database UI |
| **Database** | localhost:5432 | Direct connection |

### Credentials
```
pgAdmin:
  Email: admin@spacehub.local
  Password: admin123

PostgreSQL:
  User: postgres
  Password: postgres
  Database: aihub
```

---

## 🛠️ QUICK FIXES

### Kill a Port
```powershell
# Find process on port 8080
netstat -ano | findstr :8080

# Kill it (replace PID with actual process ID)
taskkill /PID 12345 /F
```

### Clean Restart Everything
```powershell
cd 'C:\Users\ettao\Desktop\spacehub'
docker-compose down -v
docker-compose up --build
```

### Restart TypeScript Server in VS Code
- Press: **Ctrl+Shift+P**
- Type: **TypeScript: Restart TS server**
- Press: **Enter**

### Rebuild Frontend
```powershell
cd 'C:\Users\ettao\Desktop\spacehub\frontend'
npm install
npx ng build admin --configuration development
```

### Rebuild Backend
```powershell
cd 'C:\Users\ettao\Desktop\spacehub\backend'
.\mvnw.cmd clean package -DskipTests
```

---

## 📊 FILES FIXED

```
✅ frontend/projects/admin/src/app/app.spec.ts
✅ frontend/projects/admin/src/app/app.ts
✅ frontend/projects/admin/src/app/features/dashboard/dashboard.component.ts
✅ frontend/projects/admin/src/app/shared/icons/icons.module.ts (CREATED)
✅ frontend/projects/admin/tsconfig.spec.json
```

---

## ✨ WHAT TO EXPECT

### On First Load
1. PostgreSQL starts (takes ~10 seconds)
2. Backend starts on port 8080 (takes ~20 seconds)
3. Frontend starts on port 80/4200 (takes ~30 seconds)
4. Dashboard appears with:
   - Login page
   - Booking calendar
   - Stats dashboard
   - Dark/Light theme

### What You Can Do
- ✅ Register new user
- ✅ Login with email/password
- ✅ View available spaces
- ✅ Create bookings
- ✅ View booking history
- ✅ Leave reviews

---

## 🔍 MONITORING

### Check Logs
```powershell
# Backend logs
docker-compose logs backend

# Database logs
docker-compose logs postgres

# Frontend build output
# Check terminal where you ran: ng serve
```

### Check Services Are Running
```powershell
docker-compose ps
```

Should show:
- ✅ spacehub-postgres RUNNING
- ✅ spacehub-pgadmin RUNNING
- ✅ spacehub-backend RUNNING
- ✅ spacehub-frontend RUNNING

---

## 🎯 COMMON WORKFLOWS

### Workflow 1: Full Cycle Test (5 minutes)
```powershell
# 1. Start everything
docker-compose up --build

# 2. Wait for services to start (watch logs)
# 3. Open http://localhost
# 4. Register: john@test.com / password123
# 5. Login
# 6. Create booking
# 7. Verify in database (pgAdmin)
```

### Workflow 2: API Testing
```powershell
# Start backend only
.\mvnw.cmd spring-boot:run

# Test endpoints with curl (see above)
# Or open: http://localhost:8080/swagger-ui.html
```

### Workflow 3: Frontend Development
```powershell
# Run frontend dev server
npx ng serve admin --configuration development

# Opens: http://localhost:4200
# Make code changes - auto-reload enabled
# Run tests: npm test
```

---

## ⏱️ STARTUP TIMES

| Service | Time |
|---------|------|
| PostgreSQL | ~10 sec |
| Backend (Spring Boot) | ~20 sec |
| Frontend (Dev Server) | ~30 sec |
| Total Startup | ~60 sec |

---

## 💡 TIPS

- 🐳 Use **Docker** for production/demo
- 💻 Use **Local Dev** for active development
- 📚 Check **RUN_PROJECT.md** for detailed guide
- 📋 Check **FIXES_APPLIED.md** for what changed
- 🔧 Check **FINAL_STATUS.md** for verification results
- 📖 Use **Swagger UI** to explore API

---

**Ready? Run this now:**
```powershell
cd 'C:\Users\ettao\Desktop\spacehub' && docker-compose up --build
```

Then open: **http://localhost** in your browser 🚀

