@echo off
echo Starting Authentication Backend...
echo.

REM Check if .env file exists
if not exist ".env" (
    echo ❌ .env file not found!
    echo Please run setup-env.bat first to create the .env file
    echo.
    pause
    exit /b 1
)

echo ✅ .env file found
echo.

REM Test database connection first
echo 🔍 Testing database connection...
node test-connection.js
if %errorlevel% neq 0 (
    echo.
    echo ❌ Database connection failed! Please fix the connection issues first.
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Database connection successful!
echo 🚀 Starting authentication server...
echo.

REM Start the server
node server.js
