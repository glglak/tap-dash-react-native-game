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

REM First apply the Gradle plugin fix
echo Applying direct fix for the React Native Gradle plugin...
call node ./fix-gradle-plugin.js
echo.

REM Clean any previous build artifacts
echo Cleaning previous build artifacts...
if exist android\app\build rmdir /s /q android\app\build
echo.

REM Navigate to android directory and run the build
echo Running Gradle build command...
cd android
call gradlew.bat :app:%BUILD_TYPE% --no-daemon
set BUILD_RESULT=%ERRORLEVEL%
cd ..

REM Check if the build actually created the output file
if "%BUILD_TYPE%"=="bundleRelease" (
  set OUTPUT_FILE=%CD%\android\app\build\outputs\bundle\release\app-release.aab
) else (
  set OUTPUT_FILE=%CD%\android\app\build\outputs\apk\release\app-release.apk
)

REM Determine if the build truly succeeded by checking if the output file exists
if %BUILD_RESULT% NEQ 0 (
  echo.
  echo Build process reported errors, checking output file...
  if exist "%OUTPUT_FILE%" (
    echo.
    echo ⚠️ The build reported errors but the output file was still created.
    echo This might be a warning rather than a fatal error.
    echo.
    echo Your %BUILD_NAME% is available at:
    echo %OUTPUT_FILE%
    echo.
    echo Please test this file thoroughly as it may not be fully reliable.
    exit /b 0
  ) else (
    echo.
    echo ❌ Build failed and no output file was created.
    echo See the error messages above for details.
    exit /b 1
  )
) else (
  if exist "%OUTPUT_FILE%" (
    echo.
    echo ✅ Build completed successfully!
    echo.
    echo Your %BUILD_NAME% is available at:
    echo %OUTPUT_FILE%
    exit /b 0
  ) else (
    echo.
    echo ⚠️ Build reported success but no output file was found.
    echo This is unusual - check for warnings in the build output above.
    exit /b 1
  )
)
