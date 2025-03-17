@echo off
echo ========================================
echo  Fresh Android Build with Expo CLI
echo ========================================

REM Step 1: Kill all processes that might be locking Android folder
echo Closing potentially conflicting processes...
taskkill /F /IM java.exe /T 2>nul
taskkill /F /IM node.exe /T 2>nul
taskkill /F /IM adb.exe /T 2>nul
timeout /t 2 /nobreak >nul

REM Step 2: Clean up existing build artifacts
echo Cleaning up existing build artifacts...
rmdir /s /q "C:\Users\karim.deraz\source\repos\tap-dash-game\android\app\build" 2>nul
rmdir /s /q "C:\Users\karim.deraz\source\repos\tap-dash-game\android\build" 2>nul
rmdir /s /q "C:\Users\karim.deraz\source\repos\tap-dash-game\android\.gradle" 2>nul

REM Step 3: Run Expo prebuild to generate native code
echo Generating fresh Android project with Expo...
call npx expo prebuild --platform android --no-install

REM Step 4: Set Java Home
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.6.7-hotspot"
echo Using Java Home: %JAVA_HOME%

REM Step 5: Try direct Gradle build since it's more reliable
cd android
echo Building directly with Gradle...
call .\gradlew assembleRelease --info

REM Check build result
if %ERRORLEVEL% NEQ 0 (
    echo Direct Gradle build failed. Trying with EAS CLI...
    cd ..
    call npx eas-cli build --platform android --profile local --local --non-interactive
) else (
    echo Build succeeded!
    echo APK location: app\build\outputs\apk\release\app-release.apk
    cd ..
)

echo Build process completed.
pause
