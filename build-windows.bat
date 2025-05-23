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

REM Get Java version
"%JAVA_HOME%\bin\java" -version 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo Warning: Unable to determine Java version
)

REM Determine build type based on arguments
set BUILD_TYPE=bundleRelease
set BUILD_NAME=AAB file for Google Play

if "%1"=="--apk" (
  set BUILD_TYPE=assembleRelease
  set BUILD_NAME=APK file for direct installation
)

echo Building %BUILD_NAME%...
echo.

REM First run our special fixes
echo Running React Native Gradle plugin fixes...
call node ./fix-react-native-plugin.js
echo.

REM Clean any previous build artifacts
echo Cleaning previous build artifacts...
if exist android\app\build rmdir /s /q android\app\build
echo.

REM Create directory for node_modules/@react-native/gradle-plugin if it doesn't exist
if not exist node_modules\@react-native\gradle-plugin mkdir node_modules\@react-native\gradle-plugin
echo. > node_modules\@react-native\gradle-plugin\react-native.gradle 

REM Set additional environment variables to help with Java compatibility
set JAVA_OPTS=--add-opens=java.base/java.io=ALL-UNNAMED --add-opens=java.base/java.util=ALL-UNNAMED
set GRADLE_OPTS=-Dorg.gradle.jvmargs="-Xmx2048m -XX:MaxMetaspaceSize=512m --add-opens=java.base/java.io=ALL-UNNAMED --add-opens=java.base/java.util=ALL-UNNAMED"

REM Make sure the debug keystore exists
if not exist android\app\debug.keystore (
  echo Creating debug keystore...
  cd android\app
  "%JAVA_HOME%\bin\keytool" -genkeypair -v -storetype PKCS12 -keystore debug.keystore -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android -dname "CN=Android Debug,O=Android,C=US"
  cd ..\..
  echo Created debug keystore.
  echo.
)

REM Try two build approaches (first with React Native then with Expo)
echo Attempting build with standard approach...
cd android
call gradlew.bat :app:%BUILD_TYPE% --no-daemon --stacktrace
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
  echo First build approach failed, trying alternative method with Expo...
  echo.
  
  REM Try the Expo prebuild approach
  call npx expo prebuild --platform android --clean
  
  REM Now try building again
  cd android
  call gradlew.bat :app:%BUILD_TYPE% --no-daemon --stacktrace
  set BUILD_RESULT=%ERRORLEVEL%
  cd ..
) 

REM Check if the output file exists after either build attempt
if exist "%OUTPUT_FILE%" (
  echo.
  echo ✅ Build completed successfully!
  echo.
  echo Your %BUILD_NAME% is available at:
  echo %OUTPUT_FILE%
  exit /b 0
) else (
  echo.
  echo ❌ Build failed and no output file was created.
  echo.
  echo Recommendation: Use EAS build when it becomes available:
  echo npx eas-cli build --platform android --profile production
  exit /b 1
)
