@echo off
echo ===== Tap Dash Game Local Build Tool =====
echo.

rem Check if Android directory exists
if not exist "android" (
  echo Android directory not found. Running prebuild...
  call npx expo prebuild --platform android
) else (
  echo Android directory found.
)

rem Make gradlew executable
echo Making gradlew executable...
attrib -R android\gradlew
echo.

echo Choose a build option:
echo 1. Build APK (Debug)
echo 2. Build APK (Release)
echo 3. Build AAB for Google Play
echo 4. Run Environment Check
echo 5. Exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
  echo Building Debug APK...
  cd android && gradlew assembleDebug && cd ..
  echo.
  echo Debug APK created at: android\app\build\outputs\apk\debug\app-debug.apk
)

if "%choice%"=="2" (
  echo Building Release APK...
  cd android && gradlew assembleRelease && cd ..
  echo.
  echo Release APK created at: android\app\build\outputs\apk\release\app-release.apk
)

if "%choice%"=="3" (
  echo Building App Bundle (AAB) for Google Play...
  cd android && gradlew bundleRelease && cd ..
  echo.
  echo App Bundle created at: android\app\build\outputs\bundle\release\app-release.aab
)

if "%choice%"=="4" (
  echo Running environment check...
  echo.
  echo Node.js version:
  node -v
  echo.
  echo npm version:
  npm -v
  echo.
  echo Expo CLI version:
  call npx expo --version
  echo.
  echo EAS CLI version:
  call npx eas-cli --version
  echo.
  
  if exist "android\gradlew" (
    echo gradlew file: EXISTS
    echo.
    echo Gradle version:
    cd android && gradlew --version
    cd ..
  ) else (
    echo gradlew file: MISSING
  )
)

if "%choice%"=="5" (
  echo Exiting...
  exit /b
)

echo.
echo Process completed.
pause
