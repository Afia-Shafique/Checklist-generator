@echo off
echo Creating .env file for authentication backend...
echo.

echo DATABASE_URL=postgresql://postgres:haiqa@localhost:5432/compliance_db > .env
echo JWT_SECRET=supersecretjwtkey >> .env

echo .env file created successfully!
echo.
echo Please verify your PostgreSQL settings:
echo 1. PostgreSQL is running on localhost:5432
echo 2. Database 'compliance_db' exists
echo 3. User 'postgres' with password 'haiqa' has access
echo.
echo If your password contains special characters, you may need to URL encode it.
echo For example, if your password is 'my@password', use 'my%40password'
echo.
pause
