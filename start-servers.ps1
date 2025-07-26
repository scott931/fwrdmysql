Write-Host "Starting Forward Africa Development Servers..." -ForegroundColor Green
Write-Host ""

Write-Host "Starting Backend Server (Port 3002)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start"

Write-Host ""
Write-Host "Starting Frontend Server (Port 3000/3001)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host ""
Write-Host "Both servers are starting..." -ForegroundColor Green
Write-Host "Backend: http://localhost:3002" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000 (or 3001 if 3000 is busy)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")