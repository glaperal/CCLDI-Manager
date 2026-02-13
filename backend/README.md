# CCLDI Backend API

RESTful API backend for the CCLDI Student Management System built with Node.js, Express, and PostgreSQL.

## 🏗️ Architecture

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js       # PostgreSQL connection pool
│   │   ├── schema.sql        # Database schema
│   │   └── init-db.js        # Database initialization script
│   └── routes/
│       ├── centers.js        # Centers endpoints
│       ├── students.js       # Students CRUD endpoints
│       ├── billing.js        # Billing and payments endpoints
│       └── settings.js       # Settings endpoints
├── server.js                 # Main server file
├── package.json              # Dependencies
└── .env                      # Environment variables (create from .env.example)
```

## 📋 Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **Git** (for version control)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup PostgreSQL Database

#### Option A: Local PostgreSQL (Development)

1. Install PostgreSQL on your machine
2. Create a new database:
```sql
CREATE DATABASE ccldi_db;
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` and update the DATABASE_URL:
```env
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/ccldi_db
```

#### Option B: Free Cloud Database (Production)

**Railway** (Recommended - Free tier):
1. Go to [Railway.app](https://railway.app/)
2. Sign up with GitHub
3. Create New Project → Provision PostgreSQL
4. Copy the DATABASE_URL from Variables tab
5. Paste into your `.env` file

**Supabase** (Alternative):
1. Go to [Supabase.com](https://supabase.com/)
2. Create new project
3. Get connection string from Database Settings
4. Use connection string in `.env`

### 3. Initialize Database

Run the initialization script to create tables and seed data:

```bash
npm run init-db
```

This will:
- Create all database tables (centers, students, billing, settings)
- Insert 16 CCLDI centers
- Insert default settings
- Add 3 sample students for testing

### 4. Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The API will be running at `http://localhost:3000`

### 5. Test the API

Visit `http://localhost:3000/health` to verify the server is running.

You should see:
```json
{
  "status": "healthy",
  "timestamp": "2024-02-14T...",
  "service": "CCLDI Backend API"
}
```

## 📡 API Endpoints

### Centers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/centers` | Get all centers |
| GET | `/api/centers/:id` | Get single center |
| GET | `/api/centers/:id/stats` | Get center statistics (enrollment, capacity, AR) |

### Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/students` | Get all students (supports filters: centerId, status, search) |
| GET | `/api/students/:id` | Get single student |
| GET | `/api/students/:id/ar` | Get student AR details |
| POST | `/api/students` | Create new student |
| PUT | `/api/students/:id` | Update student |
| DELETE | `/api/students/:id` | Delete student (soft delete) |

### Billing

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/billing` | Get all payments (supports filters: studentId, centerId, dates) |
| GET | `/api/billing/aging-report` | Get aging report |
| GET | `/api/billing/stats` | Get payment statistics |
| POST | `/api/billing` | Record new payment |

### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Get all settings |
| GET | `/api/settings/:key` | Get single setting |
| PUT | `/api/settings/:key` | Update setting |

## 🧪 Example API Calls

### Get All Students
```bash
curl http://localhost:3000/api/students
```

### Create New Student
```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "Dela Cruz",
    "age": 5,
    "gender": "Male",
    "parent": "Maria Dela Cruz",
    "contact": "09171234567",
    "email": "maria@email.com",
    "centerId": "alabang",
    "tuition": 15000
  }'
```

### Record Payment
```bash
curl -X POST http://localhost:3000/api/billing \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": 1,
    "type": "tuition",
    "amount": 15000,
    "paymentDate": "2024-02-14",
    "notes": "February payment"
  }'
```

### Get Aging Report
```bash
curl http://localhost:3000/api/billing/aging-report
```

## 🔧 Environment Variables

Create a `.env` file in the backend directory:

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:8080
```

## 🌐 Deployment

### Deploy to Railway (Free Tier)

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login:
```bash
railway login
```

3. Initialize project:
```bash
railway init
```

4. Add PostgreSQL:
```bash
railway add postgresql
```

5. Deploy:
```bash
railway up
```

6. Set environment variables in Railway dashboard:
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://glaperal.github.io/CCLDI-Manager`

7. Run database initialization:
```bash
railway run npm run init-db
```

### Deploy to Render (Free Tier)

1. Push your code to GitHub
2. Go to [Render.com](https://render.com/)
3. Create New → Web Service
4. Connect your GitHub repository
5. Configure:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
6. Add PostgreSQL database (free tier)
7. Set environment variables
8. Deploy

## 🔒 Security Best Practices

For production:

1. **Enable HTTPS**: Always use HTTPS in production
2. **Environment Variables**: Never commit `.env` file
3. **Rate Limiting**: Add rate limiting middleware
4. **Authentication**: Implement JWT authentication
5. **Input Validation**: All routes have validation (already implemented)
6. **SQL Injection**: Using parameterized queries (already implemented)

## 📊 Database Schema

### Centers Table
```sql
- id (VARCHAR, PRIMARY KEY)
- name (VARCHAR)
- type (VARCHAR) - 'corporate' or 'franchise'
- capacity (INTEGER)
- created_at, updated_at (TIMESTAMP)
```

### Students Table
```sql
- id (SERIAL, PRIMARY KEY)
- first_name, last_name (VARCHAR)
- age (INTEGER)
- gender (VARCHAR)
- parent, contact, email (VARCHAR)
- center_id (VARCHAR, FOREIGN KEY)
- tuition (DECIMAL)
- enrollment_date (DATE)
- status (VARCHAR) - 'active', 'inactive', 'graduated'
- created_at, updated_at (TIMESTAMP)
```

### Billing Table
```sql
- id (SERIAL, PRIMARY KEY)
- student_id (INTEGER, FOREIGN KEY)
- type (VARCHAR) - 'tuition' or 'miscellaneous'
- amount (DECIMAL)
- payment_date (DATE)
- month_for (VARCHAR) - YYYY-MM format
- status (VARCHAR) - 'paid', 'partial', 'pending'
- notes (TEXT)
- created_at, updated_at (TIMESTAMP)
```

### Settings Table
```sql
- key (VARCHAR, PRIMARY KEY)
- value (TEXT)
- description (TEXT)
- updated_at (TIMESTAMP)
```

## 🐛 Troubleshooting

### Connection Errors

**Error**: `ECONNREFUSED` or `connection refused`
- Check PostgreSQL is running
- Verify DATABASE_URL is correct
- Check port 5432 is not blocked by firewall

**Error**: `password authentication failed`
- Verify username and password in DATABASE_URL
- Check PostgreSQL user permissions

### Database Errors

**Error**: `relation "students" does not exist`
- Run database initialization: `npm run init-db`

**Error**: `duplicate key value violates unique constraint`
- Center IDs or setting keys must be unique
- Check for existing records before inserting

## 📞 Support

For issues or questions:
- Check the main [README](../README.md)
- Review API documentation above
- Check PostgreSQL logs for database issues
- Verify all environment variables are set correctly

## 📄 License

Proprietary - CCLDI Internal Use Only
