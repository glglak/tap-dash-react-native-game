@echo off
echo Looking for Java installation...

REM Try to find Java in common installation directories
set FOUND_JAVA=0

REM Check Eclipse Adoptium locations
for /d %%i in ("C:\Program Files\Eclipse Adoptium\jdk*") do (
  if exist "%%i\bin\java.exe" (
    set "JAVA_HOME=%%i"
    set FOUND_JAVA=1
    echo Found Java at: %%i
    goto :found_java
  )
)

REM Check Eclipse Temurin locations
for /d %%i in ("C:\Program Files\Eclipse Temurin\jdk*") do (
  if exist "%%i\bin\java.exe" (
    set "JAVA_HOME=%%i"
    set FOUND_JAVA=1
    echo Found Java at: %%i
    goto :found_java
  )
)

REM Check Oracle JDK locations
for /d %%i in ("C:\Program Files\Java\jdk*") do (
  if exist "%%i\bin\java.exe" (
    set "JAVA_HOME=%%i"
    set FOUND_JAVA=1
    echo Found Java at: %%i
    goto :found_java
  )
)

REM Check if JAVA_HOME is already defined
if defined JAVA_HOME (
  if exist "%JAVA_HOME%\bin\java.exe" (
    set FOUND_JAVA=1
    echo Using existing JAVA_HOME: %JAVA_HOME%
    goto :found_java
  )
)

:check_java_result
if %FOUND_JAVA% EQU 0 (
  echo ERROR: Could not find Java installation.
  echo Please install Java from https://adoptium.net/
  echo or set JAVA_HOME manually to your Java installation directory.
  exit /b 1
)

:found_java
echo Setting JAVA_HOME to: %JAVA_HOME%
echo.

REM Determine build type based on arguments
set BUILD_TYPE=bundleRelease
set BUILD_NAME=AAB file for Google Play

if "%1"=="--apk" (
  set BUILD_TYPE=assembleRelease
  set BUILD_NAME=APK file for direct installation
)

echo Building %BUILD_NAME%...
echo.

REM Run the Gradle patch first
echo Running Gradle plugin patch...
call node ./gradle-plugin-patch.js
echo.

REM Navigate to android directory and run the build
echo Running Gradle build command...
cd android
call gradlew.bat :app:%BUILD_TYPE% --no-daemon
cd ..

REM Check the result
if %ERRORLEVEL% NEQ 0 (
  echo.
  echo Build failed. See error messages above.
  exit /b 1
) else (
  echo.
  echo Build completed successfully!
  if "%BUILD_TYPE%"=="bundleRelease" (
    echo Your AAB file is available at:
    echo %CD%\android\app\build\outputs\bundle\release\app-release.aab
  ) else (
    echo Your APK file is available at:
    echo %CD%\android\app\build\outputs\apk\release\app-release.apk
  )
)
