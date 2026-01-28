@echo off
echo ========================================
echo Starting Production Servers
echo ========================================
echo.

cd /d "%~dp0"

echo [1/2] Building frontend for production...
cd frontend
npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Frontend build failed
    pause
    exit /b 1
)
cd ..

echo.
echo [2/2] Starting production backend server...
echo Backend API: http://localhost:3001
echo Frontend will be served from backend
echo.
echo Press Ctrl+C to stop the server
echo.

cd backend
npm start

pause
