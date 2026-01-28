@echo off
echo ========================================
echo Starting AL TAMIMI College System Servers
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not found in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [2/3] Installing dependencies if needed...
if not exist "node_modules" (
    echo Installing root dependencies...
    npm install
)

if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend && npm install && cd ..
)

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend && npm install && cd ..
)

echo.
echo [3/3] Starting all servers...
echo.
echo Backend API: http://localhost:3001
echo Frontend:    http://localhost:5173
echo.
echo Press Ctrl+C to stop all servers
echo.

REM Start all servers concurrently
npm run dev

pause
