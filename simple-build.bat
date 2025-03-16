@echo off
echo Starting simple build process for Android...
echo This script uses Expo EAS Build instead of local building

echo.
echo Checking Expo CLI installation...
call npx expo --version > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Installing Expo CLI...
  call npm install -g expo-cli
)

echo.
echo Checking EAS CLI installation...
call npx eas-cli --version > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Installing EAS CLI...
  call npm install -g eas-cli
)

echo.
echo Creating a minimal eas.json configuration...
echo {> eas.json
echo   "build": {>> eas.json
echo     "development": {>> eas.json
echo       "developmentClient": true,>> eas.json
echo       "distribution": "internal">> eas.json
echo     },>> eas.json
echo     "preview": {>> eas.json
echo       "distribution": "internal",>> eas.json
echo       "android": {>> eas.json
echo         "buildType": "apk">> eas.json
echo       }>> eas.json
echo     },>> eas.json
echo     "production": {>> eas.json
echo       "autoIncrement": true,>> eas.json
echo       "android": {>> eas.json
echo         "buildType": "app-bundle">> eas.json
echo       }>> eas.json
echo     }>> eas.json
echo   },>> eas.json
echo   "cli": {>> eas.json
echo     "version": ">= 3.7.2",>> eas.json
echo     "requireCommit": false>> eas.json
echo   }>> eas.json
echo }>> eas.json

echo.
echo Logging in to Expo...
call npx eas-cli login

echo.
echo What would you like to build?
echo 1. APK file for testing (internal distribution)
echo 2. AAB file for Google Play submission
choice /C 12 /N /M "Enter your choice (1 or 2): "

if %ERRORLEVEL% EQU 1 (
  echo.
  echo Building APK file for testing...
  echo This will create a downloadable APK file when complete.
  call npx eas-cli build --platform android --profile preview --non-interactive
) else (
  echo.
  echo Building AAB file for Google Play submission...
  echo This will create a Google Play compatible bundle when complete.
  call npx eas-cli build --platform android --profile production --non-interactive
)

if %ERRORLEVEL% NEQ 0 (
  echo.
  echo Build process encountered an error.
  echo Please check the error messages above.
  exit /b 1
) else (
  echo.
  echo Build process initiated successfully!
  echo You will receive a URL in your terminal and by email when the build is complete.
  echo.
  echo To check build status: npx eas-cli build:list
  exit /b 0
)
