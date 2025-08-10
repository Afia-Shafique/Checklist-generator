# Authentication Troubleshooting Guide

## Quick Fix Steps

### 1. Set up Environment File
```bash
# Run this in auth-backend directory
setup-env.bat
```

### 2. Test Database Connection
```bash
# Test if database is accessible
node test-connection.js
```

### 3. Start Authentication Server
```bash
# Start with connection testing
start.bat
```

## Common Issues and Solutions

### SASL SCRAM Error: "client password must be a string"

**Problem**: This error occurs when the password in your DATABASE_URL contains special characters that need to be URL-encoded.

**Solution**: 
1. Check your PostgreSQL password for special characters
2. URL encode special characters in your `.env` file:

| Character | URL Encoded |
|-----------|-------------|
| @ | %40 |
| # | %23 |
| $ | %24 |
| & | %26 |
| + | %2B |
| / | %2F |
| : | %3A |
| = | %3D |
| ? | %3F |
| space | %20 |

**Example**: If your password is `my@password`, change it to `my%40password` in the DATABASE_URL.

### Database Connection Refused

**Problem**: PostgreSQL is not running or not accessible.

**Solutions**:
1. **Start PostgreSQL service**:
   ```bash
   # Windows (as administrator)
   net start postgresql-x64-15
   
   # Or start from pgAdmin
   ```

2. **Check if PostgreSQL is running on port 5432**:
   ```bash
   netstat -an | findstr 5432
   ```

3. **Verify database exists**:
   - Open pgAdmin
   - Connect to your server
   - Check if `compliance_db` database exists
   - If not, create it

### Authentication Failed

**Problem**: Wrong username/password or user doesn't have access.

**Solutions**:
1. **Verify credentials in pgAdmin**:
   - Try connecting with the same credentials in pgAdmin
   - Check if user `postgres` exists and has correct password

2. **Reset PostgreSQL password** (if needed):
   ```sql
   ALTER USER postgres PASSWORD 'new_password';
   ```

3. **Grant database access**:
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE compliance_db TO postgres;
   ```

### Missing .env File

**Problem**: Environment variables not configured.

**Solution**:
1. Run `setup-env.bat` in the auth-backend directory
2. Verify the `.env` file was created
3. Check the contents match your PostgreSQL setup

## Database Setup Commands

If you need to set up the database from scratch:

```sql
-- Create database
CREATE DATABASE compliance_db;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    region_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE compliance_db TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
```

## Testing Your Setup

1. **Test database connection**:
   ```bash
   node test-connection.js
   ```

2. **Test health endpoint** (after starting server):
   ```bash
   curl http://localhost:5001/api/health
   ```

3. **Test signup endpoint**:
   ```bash
   curl -X POST http://localhost:5001/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","full_name":"Test User"}'
   ```

## pgAdmin Configuration

1. **Add new server**:
   - Host: `localhost`
   - Port: `5432`
   - Database: `postgres` (or `compliance_db`)
   - Username: `postgres`
   - Password: Your actual password

2. **Test connection** in pgAdmin before running the app

3. **Create database** if it doesn't exist:
   - Right-click on "Databases"
   - Select "Create" > "Database"
   - Name it `compliance_db`

## Environment Variables Reference

Your `.env` file should contain:
```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/compliance_db
JWT_SECRET=your_jwt_secret_key
```

Replace `your_password` with your actual PostgreSQL password (URL-encoded if needed).
