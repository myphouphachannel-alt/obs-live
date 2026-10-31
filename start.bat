@echo off
chcp 65001 >nul
title OBS LOWER THIRD CONTROL PANEL

echo ======================================================================
echo          OBS LOWER THIRD CONTROL PANEL - LIVE BROADCAST SYSTEM
echo ======================================================================
echo.
echo  กำลังตรวจสอบระบบ Node.js...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] ไม่พบ Node.js บนเครื่องของคุณ!
    echo กรุณาดาวน์โหลดและติดตั้ง Node.js จาก https://nodejs.org/ แล้วลองใหม่อีกครั้ง
    echo.
    pause
    exit /b
)

if not exist node_modules (
    echo [INFO] กำลังติดตั้ง Dependencies กรุณารอสักครู่...
    call npm install
)

echo [INFO] เริ่มต้นระบบเซิร์ฟเวอร์ Real-Time Broadcast Control Panel...
echo.
echo ======================================================================
echo   Control Panel (OBS Dock) : http://localhost:3000/
echo   OBS Overlay (Browser Src): http://localhost:3000/overlay
echo ======================================================================
echo.
echo กำลังเปิดหน้าต่าง Control Panel บนเว็บเบราว์เซอร์...
start http://localhost:3000/

npm run dev
pause
