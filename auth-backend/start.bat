@echo off
echo Starting Authentication Backend...
echo.
echo Make sure you have:
echo 1. PostgreSQL running
echo 2. Database 'compliance_db' created
echo 3. .env file configured
echo.
echo Installing dependencies...
npm install
echo.
echo Starting server...
npm run dev
pause
