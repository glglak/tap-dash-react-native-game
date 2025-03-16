@echo off
echo Starting minimal build process...
echo This script tries to build with minimal dependencies

REM Find Java
set FOUND_JAVA=0
if defined JAVA_HOME (
  if exist "%JAVA_HOME%\bin\java.exe" (
    set FOUND_JAVA=1
    echo Using existing JAVA_HOME: %JAVA_HOME%
    goto :java_found
  )
)

REM Check common Java locations
for /d %%i in ("C:\Program Files\Eclipse Adoptium\jdk*") do (
  if exist "%%i\bin\java.exe" (
    set "JAVA_HOME=%%i"
    set FOUND_JAVA=1
    echo Found Java at: %%i
    goto :java_found
  )
)

for /d %%i in ("C:\Program Files\Eclipse Temurin\jdk*") do (
  if exist "%%i\bin\java.exe" (
    set "JAVA_HOME=%%i"
    set FOUND_JAVA=1
    echo Found Java at: %%i
    goto :java_found
  )
)

echo ERROR: Could not find Java installation.
echo Please install Java from https://adoptium.net/
exit /b 1

:java_found
echo Setting up build environment...

REM Clean existing builds
if exist android\app\build rmdir /s /q android\app\build

REM Make sure debug keystore exists
if not exist android\app\debug.keystore (
  echo Creating debug keystore...
  cd android\app
  "%JAVA_HOME%\bin\keytool" -genkeypair -v -storetype PKCS12 -keystore debug.keystore -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android -dname "CN=Android Debug,O=Android,C=US"
  cd ..\..
)

REM Set Java compatibility flags
set JAVA_OPTS=--add-opens=java.base/java.io=ALL-UNNAMED --add-opens=java.base/java.util=ALL-UNNAMED

REM Set build type (AAB or APK)
set BUILD_TYPE=%1
if "%BUILD_TYPE%"=="" set BUILD_TYPE=bundleRelease

REM Create a local.properties file pointing to Android SDK if needed
if not exist android\local.properties (
  echo Creating local.properties...
  echo sdk.dir=%LOCALAPPDATA%\Android\Sdk> android\local.properties
)

REM Patch gradle-wrapper.properties to use a known good version
echo Updating gradle-wrapper.properties...
mkdir -p android\gradle\wrapper
echo distributionBase=GRADLE_USER_HOME> android\gradle\wrapper\gradle-wrapper.properties
echo distributionPath=wrapper/dists>> android\gradle\wrapper\gradle-wrapper.properties
echo distributionUrl=https\://services.gradle.org/distributions/gradle-8.0-bin.zip>> android\gradle\wrapper\gradle-wrapper.properties
echo zipStoreBase=GRADLE_USER_HOME>> android\gradle\wrapper\gradle-wrapper.properties
echo zipStorePath=wrapper/dists>> android\gradle\wrapper\gradle-wrapper.properties

REM Try building with minimal arguments
echo Building with minimal configuration...
cd android
call gradlew.bat %BUILD_TYPE% --no-daemon --info --stacktrace
set BUILD_RESULT=%ERRORLEVEL%
cd ..

REM Check if the build succeeded
if %BUILD_RESULT% NEQ 0 (
  echo.
  echo Build failed! Check errors above.
  exit /b 1
) else (
  echo.
  echo Build completed successfully!
  
  if "%BUILD_TYPE%"=="bundleRelease" (
    echo.
    echo Your AAB file should be available at:
    echo %CD%\android\app\build\outputs\bundle\release\app-release.aab
  ) else (
    echo.
    echo Your APK file should be available at:
    echo %CD%\android\app\build\outputs\apk\release\app-release.apk
  )
  exit /b 0
)
