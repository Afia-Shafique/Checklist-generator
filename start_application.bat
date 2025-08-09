@echo off
echo Starting Construction Document Parser Application...
echo.

echo Installing backend dependencies...
cd backend
call install_dependencies.bat
start cmd /k python run.py
cd ..

echo.
echo Starting frontend...
cd frontend
call start.bat

echo.
echo Application started! The frontend should open in your browser automatically.
echo Backend API is running at http://localhost:5000
echo Frontend is running at http://localhost:3000
echo.
pause