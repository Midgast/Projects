@echo off
echo ========================================
echo Checking Server Status
echo ========================================
echo.

cd /d "%~dp0"

echo Checking if servers are running...
echo.

echo [Backend API - Port 3001]
netstat -an | findstr :3001 >nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ RUNNING - http://localhost:3001
) else (
    echo ✗ NOT RUNNING
)

echo.
echo [Frontend Dev Server - Port 5173]
netstat -an | findstr :5173 >nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ RUNNING - http://localhost:5173
) else (
    echo ✗ NOT RUNNING
)

echo.
echo [PHP Server - Port 8000]
netstat -an | findstr :8000 >nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ RUNNING - http://localhost:8000
) else (
    echo ✗ NOT RUNNING
)

echo.
echo ========================================
echo Quick Start Commands:
echo ========================================
echo.
echo Start all development servers:   start_all_servers.bat
echo Start production server:         start_production.bat
echo Start PHP server only:           start_server.bat
echo.

pause
