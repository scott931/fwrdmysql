@echo off
echo Starting Forward Africa Development Servers...
echo.

echo Starting Backend Server (Port 3002)...
start "Backend Server" cmd /k "cd backend && npm start"

echo.
echo Starting Frontend Server (Port 3000/3001)...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3002
echo Frontend: http://localhost:3000 (or 3001 if 3000 is busy)
echo.
echo Press any key to close this window...
pause > nul