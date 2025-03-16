@echo off
setlocal

echo ===== Tap Dash Game Simple Builder =====
echo.

REM Check if Android directory exists
if not exist "android" (
  echo Android directory not found. Running prebuild...
  call npx expo prebuild --platform android
) else (
  echo Android directory found.
)

REM Make gradlew executable
echo Making gradlew executable...
attrib -R android\gradlew

REM Change to Android directory
cd android

REM Menu
echo.
echo Choose a build option:
echo 1. Build Debug APK (for testing)
echo 2. Build Release APK (for distribution)
echo 3. Build AAB (for Google Play)
echo.
choice /C 123 /N /M "Enter your choice (1-3): "

if errorlevel 3 goto BuildBundle
if errorlevel 2 goto BuildRelease
if errorlevel 1 goto BuildDebug

:BuildDebug
echo.
echo Building Debug APK...
call gradlew assembleDebug
echo.
echo Debug APK location: app\build\outputs\apk\debug\app-debug.apk
goto End

:BuildRelease
echo.
echo Building Release APK...
call gradlew assembleRelease
echo.
echo Release APK location: app\build\outputs\apk\release\app-release.apk
goto End

:BuildBundle
echo.
echo Building App Bundle for Google Play...
call gradlew bundleRelease
echo.
echo App Bundle location: app\build\outputs\bundle\release\app-release.aab
goto End

:End
cd ..
echo.
echo Build process completed.
pause
