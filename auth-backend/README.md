# Authentication Backend

This is the authentication backend for the QA/QC Compliance System.

## Setup Instructions

### 1. Install Dependencies

```bash
cd auth-backend
npm install
```

### 2. Database Setup

1. Make sure PostgreSQL is installed and running
2. Create a database named `compliance_db`
3. Run the SQL setup script:

```bash
psql -U postgres -d compliance_db -f setup-database.sql
```

### 3. Environment Configuration

1. Copy the example environment file:
```bash
cp env.example .env
```

2. Update the `.env` file with your database credentials:
```
DATABASE_URL=postgresql://username:password@localhost:5432/compliance_db
JWT_SECRET=your-secret-key-here
```

### 4. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on port 5000 by default.

## API Endpoints

### POST /api/auth/signup
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "role": "admin",
  "region_id": 1
}
```

### POST /api/auth/login
Authenticate a user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "admin",
    "region_id": 1,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

## Security Features

- Password hashing using bcrypt
- JWT token authentication
- CORS enabled for frontend integration
- Input validation and sanitization
