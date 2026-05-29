# CRM Platform — Developer Setup Guide

## Prerequisites

Install these before starting:

| Tool | Version | Download |
|---|---|---|
| Node.js | v20+ | https://nodejs.org |
| Docker Desktop | Latest | https://docker.com |
| Git | Latest | https://git-scm.com |

---

## Quick Start (Docker — Recommended)

### 1. Clone and Configure

```bash
git clone <your-repo-url> crm-platform
cd crm-platform

# Copy environment file
cp crm-core/.env.example crm-core/.env
```

### 2. Start All Services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- MongoDB on port 27017
- Redis on port 6379
- Backend API on port 3000
- Frontend on port 5173
- Nginx proxy on port 80

### 3. Access the Application

| URL | Purpose |
|---|---|
| http://localhost | Main application (via Nginx) |
| http://localhost:5173 | Frontend direct |
| http://localhost:3000/api/docs | Swagger API docs |

### 4. Default Login

After first startup the database is seeded. Provision your first tenant:

```bash
curl -X POST http://localhost:3000/api/v1/tenants/provision \
  -H "Content-Type: application/json" \
  -d '{
    "tenantCode": "DEMO",
    "companyName": "Demo Company",
    "adminEmail": "admin@demo.com",
    "adminName": "System Admin",
    "adminPassword": "Admin@123456"
  }'
```

Then login at http://localhost with:
- **Company Code:** DEMO
- **Email:** admin@demo.com
- **Password:** Admin@123456

---

## Local Development (Without Docker)

### Backend

```bash
cd crm-core
npm install
cp .env.example .env
# Edit .env with your local database credentials
npm run start:dev
```

### Frontend

```bash
cd crm-frontend
npm install
npm run dev
```

---

## Project Structure

```
crm-platform/
├── crm-core/                    ← NestJS Backend
│   ├── src/
│   │   ├── auth/                ← Login, JWT, 2FA
│   │   ├── users/               ← Users & User Groups
│   │   ├── permissions/         ← Permission Matrix Engine
│   │   ├── masters/             ← Master Data
│   │   ├── tenants/             ← Tenant Management
│   │   └── audit/               ← Audit Trail (MongoDB)
│   ├── Dockerfile
│   └── .env.example
│
├── crm-frontend/                ← React Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/            ← Login page
│   │   │   ├── dashboard/       ← KPI dashboard
│   │   │   ├── users/           ← User & group management
│   │   │   ├── permissions/     ← Permission matrix UI
│   │   │   ├── masters/         ← Master data admin
│   │   │   └── settings/        ← Tenant settings & audit
│   │   ├── store/               ← Redux store
│   │   ├── services/            ← API client (Axios)
│   │   └── hooks/               ← usePermissions hook
│   └── Dockerfile
│
├── infrastructure/
│   ├── docker/init-db.sql       ← Database schema + seeds
│   └── nginx/nginx.conf         ← Reverse proxy config
│
└── docker-compose.yml           ← Full stack orchestration
```

---

## API Reference

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/v1/auth/login | Login |
| POST | /api/v1/auth/logout | Logout |
| POST | /api/v1/auth/refresh | Refresh access token |
| GET | /api/v1/auth/me | Current user profile |
| POST | /api/v1/auth/2fa/setup | Generate 2FA QR code |
| POST | /api/v1/auth/2fa/verify | Enable 2FA |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/v1/users | List users (paginated) |
| POST | /api/v1/users | Create user |
| PUT | /api/v1/users/:id | Update user |
| PATCH | /api/v1/users/:id/status | Activate/deactivate |
| PATCH | /api/v1/users/:id/reset-password | Admin reset password |
| GET | /api/v1/users/groups | List user groups |
| POST | /api/v1/users/groups | Create user group |

### Permissions
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/v1/permissions/my-map | Get permission map (on login) |
| GET | /api/v1/permissions/modules | Module hierarchy |
| GET | /api/v1/permissions/grid/:groupId | Permission grid for a group |
| POST | /api/v1/permissions/set | Save permission matrix |
| POST | /api/v1/permissions/copy | Copy from one group to another |

### Masters
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/v1/masters/categories | All categories |
| GET | /api/v1/masters/:code/values | Values for a category |
| POST | /api/v1/masters/bulk-values | Bulk fetch multiple categories |
| POST | /api/v1/masters/:code/values | Create value |
| PUT | /api/v1/masters/values/:id | Update value |
| DELETE | /api/v1/masters/values/:id | Delete value |

---

## Adding a New CRM Module (e.g. Contacts)

1. Create `crm-contacts/` following the same NestJS structure as `crm-core/`
2. Add a new PostgreSQL database in `docker-compose.yml`
3. Register the module in the core `modules` table
4. Add sub-modules, pages, and fields to the core database
5. The permission matrix UI automatically shows the new module
6. Add the frontend pages under `crm-frontend/src/pages/contacts/`
7. Add routes in `App.tsx`

---

## Security Checklist (Before Production)

- [ ] Change `JWT_SECRET` to a 64+ character random string
- [ ] Change all database passwords in `docker-compose.yml`
- [ ] Enable `DB_SSL=true` for cloud databases
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper SSL certificates in Nginx
- [ ] Enable AWS S3 or equivalent for file storage
- [ ] Set up database backups
- [ ] Configure CloudWatch / logging service
- [ ] Run security audit: `npm audit` in both `crm-core` and `crm-frontend`
- [ ] Enable 2FA for all admin accounts

---

## Environment Variables Reference

| Variable | Description | Default |
|---|---|---|
| `JWT_SECRET` | JWT signing secret — **change this!** | (required) |
| `JWT_EXPIRES_IN` | Access token lifetime | 24h |
| `DB_HOST` | PostgreSQL host | localhost |
| `REDIS_HOST` | Redis host | localhost |
| `MONGO_URI` | MongoDB connection string | (required) |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |

---

*CRM Platform v1.0 — Phase 0 (Core) Complete*
*Next: Phase 1 — Contacts, Leads, Sales, Activities modules*
