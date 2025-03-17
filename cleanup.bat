@echo off
echo ========================================
echo  Project Cleanup Script
echo ========================================

echo This script will remove build artifacts and temporary files.
echo Press Ctrl+C to cancel or any key to continue...
pause > nul

REM Kill processes that might be locking files
echo Closing potentially conflicting processes...
taskkill /F /IM java.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM adb.exe /T 2>nul
timeout /t 2 /nobreak >nul

echo Cleaning node_modules...
if exist node_modules rmdir /s /q node_modules

echo Cleaning Android build directories...
if exist android\app\build rmdir /s /q android\app\build
if exist android\build rmdir /s /q android\build
if exist android\.gradle rmdir /s /q android\.gradle
if exist android\app\release rmdir /s /q android\app\release
if exist android\app\debug rmdir /s /q android\app\debug

echo Cleaning iOS build directories...
if exist ios\build rmdir /s /q ios\build
if exist ios\Pods rmdir /s /q ios\Pods

echo Cleaning Expo cache...
if exist .expo rmdir /s /q .expo
if exist .expo-shared rmdir /s /q .expo-shared

echo Cleaning other temporary files...
if exist .gradle rmdir /s /q .gradle
if exist .idea rmdir /s /q .idea
if exist .vscode rmdir /s /q .vscode
if exist web-build rmdir /s /q web-build
if exist dist rmdir /s /q dist

echo Cleaning temporary Metro bundler files...
if exist .metro-health-check* del /f /q .metro-health-check*

echo Cleaning npm/yarn logs...
if exist *.log del /f /q *.log
if exist yarn-error.log del /f /q yarn-error.log
if exist npm-debug.log del /f /q npm-debug.log

echo Cleaning package manager cache...
call npm cache clean --force

echo ========================================
echo Cleanup complete!
echo ========================================
echo.
echo Next steps:
echo 1. Run 'npm install' to reinstall dependencies
echo 2. Run 'npx expo prebuild --platform android --clean' to regenerate native code
echo 3. Run 'gradle-build.bat' to build the Android app
echo ========================================

pause
