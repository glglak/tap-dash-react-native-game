@echo off
echo Building Android app directly...

REM Set Java home to your JDK path
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.6.7-hotspot"
echo Using JAVA_HOME: %JAVA_HOME%

REM Clean build directories
echo Cleaning build directories...
if exist android\build rmdir /s /q android\build
if exist android\app\build rmdir /s /q android\app\build

REM Run the gradle build
echo Starting Gradle build...
cd android && .\gradlew %1 --info
cd ..

echo Build process completed.
if "%1"=="bundleRelease" (
  echo AAB file location: android\app\build\outputs\bundle\release\app-release.aab
) else if "%1"=="assembleRelease" (
  echo APK file location: android\app\build\outputs\apk\release\app-release.apk
) else (
  echo Check build output for generated files.
)

pause
