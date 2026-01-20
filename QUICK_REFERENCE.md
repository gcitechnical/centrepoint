# Church Centrepoint - Quick Reference Card

## 🚀 Quick Start Commands

### Start Infrastructure
```bash
docker-compose up -d
```

### Backend Commands
```bash
cd backend

# Build
pnpm run build

# Run migrations
pnpm run migration:run

# Seed database
pnpm run seed

# Start dev server
pnpm run start:dev

# Revert last migration
pnpm run migration:revert
```

### Frontend Commands
```bash
cd frontend

# Install dependencies
pnpm install

# Start dev server
pnpm run dev
```

---

## 🔑 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@churchcentrepoint.com` | `Admin@123` |
| GCI Admin | `admin@gci.org` | `GCI@Admin123` |
| Nairobi Branch | `admin@nairobi-hq.gci.org` | `Branch@123` |
| Regular User | `jane.smith@gci.org` | `User@123` |

---

## 📡 API Endpoints

### Authentication
```
POST /auth/register  - Register new user
POST /auth/login     - Login
GET  /auth/profile   - Get profile (protected)
GET  /auth/me        - Get current user (protected)
```

---

## 🗄️ Database Access

```bash
# Connect to PostgreSQL
docker exec -it centrepoint-postgres psql -U centrepoint -d centrepoint_dev

# Useful commands
\dt              # List tables
\d users         # Describe users table
SELECT * FROM users;
\q               # Quit
```

---

## 🐛 Troubleshooting

### Docker not running
```bash
# Check Docker status
docker ps

# Restart containers
docker-compose restart

# View logs
docker-compose logs postgres
```

### Migration errors
```bash
# Revert and re-run
pnpm run migration:revert
pnpm run migration:run
```

### Port already in use
```bash
# Find process on port 3001
lsof -i :3001

# Kill process
kill -9 <PID>
```

---

## 📂 Project Structure

```
centrepoint/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/          # Authentication
│   │   │   ├── users/         # User management
│   │   │   ├── tenants/       # Tenant entities
│   │   │   ├── studio/        # Design templates
│   │   │   └── events/        # Calendar events
│   │   ├── database/
│   │   │   ├── migrations/    # DB migrations
│   │   │   └── seeds/         # Seed data
│   │   └── app.module.ts      # Main module
│   └── .env                   # Environment vars
│
├── frontend/
│   ├── app/                   # Next.js pages
│   ├── components/            # React components
│   └── lib/                   # Utilities
│
└── docs/                      # Documentation
```

---

## 🎯 Current Status

✅ **Complete:**
- Database schema
- Authentication system
- User management
- Role-based access
- Seed data

🚧 **In Progress:**
- Tenant management
- Studio module
- Event management

📋 **Planned:**
- Frontend auth
- Canvas editor
- PDF export

---

## 📞 Quick Links

- **Backend:** http://localhost:3001
- **Frontend:** http://localhost:3000
- **Docs:** `/docs` folder
- **API Testing:** `docs/API_TESTING.md`

---

**Last Updated:** January 20, 2026
