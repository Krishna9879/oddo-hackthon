@echo off
echo ========================================
echo  WorkZen HRMS - Automatic Installation
echo ========================================
echo.
echo Installing Node.js dependencies...
echo Please wait, this may take 2-3 minutes...
echo.

call npm install

echo.
echo ========================================
echo  Installation Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Setup MySQL database (see INSTALLATION.md)
echo 2. Run: npm run dev
echo 3. Open: http://localhost:3000
echo.
pause
