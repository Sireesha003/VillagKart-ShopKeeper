@echo off
echo ========================================================
echo   VillagKart - Application Startup Script
echo ========================================================
echo.

echo [1/3] Terminating any stuck Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
echo Done.
echo.

echo [2/3] Starting the Backend Server...
cd "%~dp0\backend"
start cmd /k "npm install && npm run dev"
echo Backend is starting in a new window...
echo.

echo [3/3] Starting the Frontend Development Server...
cd "%~dp0"
start cmd /k "npm install && npm run dev"
echo Frontend is starting in a new window...
echo.

echo ========================================================
echo All servers are starting!
echo 1. Wait about 15 seconds for the backend to initialize.
echo 2. Open your browser and go to: http://localhost:3001/api/seed
echo 3. Once you see the success message, go to: http://localhost:5173
echo ========================================================
pause
