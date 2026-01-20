# Church Centrepoint

**Multi-Tenant Church Management SaaS Platform**

## Overview

Church Centrepoint is an all-in-one ERP system designed for church organizations, combining strict administrative control with creative freedom. The platform features a unique **Centrepoint Studio** - a Fabric.js-based design tool that ensures brand consistency while empowering local branches.

**Pilot Client:** Gospel Centres International (GCI)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CHURCH CENTREPOINT                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐              ┌──────────────┐            │
│  │   Frontend   │◄────────────►│   Backend    │            │
│  │   Next.js    │   REST API   │   NestJS     │            │
│  │  (Port 3000) │              │ (Port 3001)  │            │
│  └──────────────┘              └───────┬──────┘            │
│                                        │                    │
│                          ┌─────────────┴─────────────┐      │
│                          │                           │      │
│                    ┌─────▼──────┐            ┌───────▼────┐ │
│                    │ PostgreSQL │            │   Redis    │ │
│                    │ (Port 5432)│            │ (Port 6379)│ │
│                    └────────────┘            └────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | Next.js | 15.x |
| **Backend** | NestJS | 10.x |
| **Database** | PostgreSQL | 15+ |
| **Cache** | Redis | 7.x |
| **ORM** | TypeORM | 0.3.x |
| **Design Engine** | Fabric.js | 5.3.x |
| **Payments** | Stripe + M-Pesa Daraja | Latest |

## Project Structure

```
centrepoint/
├── frontend/              # Next.js application
│   ├── app/              # App router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities & services
│   └── public/           # Static assets
│
├── backend/              # NestJS application
│   ├── src/
│   │   ├── modules/      # Feature modules
│   │   ├── common/       # Shared utilities
│   │   └── database/     # Migrations & seeds
│   └── test/             # E2E tests
│
├── docs/                 # Documentation
│   ├── TECHNICAL_SPECIFICATION.md
│   ├── API.md
│   └── DEPLOYMENT.md
│
└── docker-compose.yml    # Local development setup
```

## Key Features

### 1. Multi-Tenancy
- **Row-Level Security (RLS)** for data isolation
- Hierarchical structure: HQ → Branches → Ministries
- Tenant-specific branding and configuration

### 2. Centrepoint Studio (USP)
- Fabric.js-based design tool
- Template locking mechanism (HQ controls brand elements)
- Auto-generation of event flyers with data injection
- Export to PNG/PDF

### 3. Core Modules
- **People & Discipleship:** CRM, family grouping, spiritual growth paths
- **Finance:** Budgeting, expenses, M-Pesa/Stripe integration
- **Events & Calendar:** Scheduling with auto-flyer generation
- **Inventory & Operations:** Asset management

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- PostgreSQL 15+
- Redis 7.x
- pnpm (recommended) or npm

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd centrepoint
   ```

2. **Start infrastructure**
   ```bash
   docker-compose up -d postgres redis
   ```

3. **Setup Backend**
   ```bash
   cd backend
   pnpm install
   cp .env.example .env
   pnpm run migration:run
   pnpm run seed
   pnpm run start:dev
   ```

4. **Setup Frontend**
   ```bash
   cd frontend
   pnpm install
   cp .env.example .env.local
   pnpm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Docs: http://localhost:3001/api/docs

## Development

### Database Migrations

```bash
# Create a new migration
cd backend
pnpm run migration:create src/database/migrations/MigrationName

# Run migrations
pnpm run migration:run

# Revert last migration
pnpm run migration:revert
```

### Testing

```bash
# Backend unit tests
cd backend
pnpm run test

# Backend e2e tests
pnpm run test:e2e

# Frontend tests
cd frontend
pnpm run test
```

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/centrepoint
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_test_...
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for production deployment instructions.

## Documentation

- [Technical Specification](docs/TECHNICAL_SPECIFICATION.md)
- [API Documentation](docs/API.md)
- [Database Schema](docs/DATABASE_SCHEMA.md)
- [Studio Implementation Guide](docs/STUDIO_GUIDE.md)

## License

Proprietary - All rights reserved

## Support

For support, email: support@churchcentrepoint.com

---

**Built with ❤️ for Gospel Centres International and the global Church**
