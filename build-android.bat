@echo off
echo ===== Tap Dash Game Build Tool =====
echo.

if not exist "android" (
  echo Android directory not found. Running prebuild...
  npx expo prebuild --platform android
) else (
  echo Android directory found.
)

echo Making gradlew executable...
attrib -R android\gradlew
echo.

echo Choose a build option:
echo 1. Build Debug APK
echo 2. Build Release APK
echo 3. Build AAB for Google Play
echo 4. Exit
echo.

choice /C 1234 /N /M "Enter your choice (1-4): "

if errorlevel 4 goto :exit
if errorlevel 3 goto :bundle
if errorlevel 2 goto :release
if errorlevel 1 goto :debug

:debug
echo.
echo Building Debug APK...
cd android
call gradlew assembleDebug
cd ..
echo.
echo Debug APK created at: android\app\build\outputs\apk\debug\app-debug.apk
goto :end

:release
echo.
echo Building Release APK...
cd android
call gradlew assembleRelease
cd ..
echo.
echo Release APK created at: android\app\build\outputs\apk\release\app-release.apk
goto :end

:bundle
echo.
echo Building App Bundle (AAB) for Google Play...
cd android
call gradlew bundleRelease
cd ..
echo.
echo App Bundle created at: android\app\build\outputs\bundle\release\app-release.aab
goto :end

:exit
echo Exiting...
goto :eof

:end
echo.
echo Process completed.
pause
